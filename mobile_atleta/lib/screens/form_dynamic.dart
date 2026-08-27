import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class FormDynamicScreen extends StatefulWidget {
  final String workoutId;
  final String formId;
  final String workoutTitle;

  const FormDynamicScreen({
    super.key,
    required this.workoutId,
    required this.formId,
    required this.workoutTitle,
  });

  @override
  State<FormDynamicScreen> createState() => _FormDynamicScreenState();
}

class _FormDynamicScreenState extends State<FormDynamicScreen> {
  final _formKey = GlobalKey<FormState>();
  Map<String, dynamic>? _formData;
  bool _isLoading = true;
  bool _isSubmitting = false;

  // Guarda as respostas mapeadas por pergunta: { "Pergunta X": valor }
  final Map<String, dynamic> _answers = {};

  @override
  void initState() {
    super.initState();
    _fetchForm();
  }

  Future<void> _fetchForm() async {
    try {
      final response = await ApiService.getFormById(widget.formId);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _formData = data;
          // Inicializa os valores padrao para cada pergunta
          for (var q in data['questions']) {
            if (q['type'] == 'scale_1_10') {
              _answers[q['label']] = 5.0; // Valor mediano inicial
            } else {
              _answers[q['label']] = '';
            }
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar formulário: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isSubmitting = true);

    // Formata as respostas no padrão esperado pelo back-end
    List<Map<String, dynamic>> formattedAnswers = [];
    _answers.forEach((label, value) {
      formattedAnswers.add({
        'questionLabel': label,
        'value': value,
      });
    });

    try {
      final response = await ApiService.sendCheckIn(widget.workoutId, formattedAnswers);

      if (response.statusCode == 201) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Formulário enviado e presença confirmada!')),
          );
          Navigator.pop(context); // Retorna para a tela do calendario
        }
      } else {
        final err = jsonDecode(response.body);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err['message'] ?? 'Erro ao enviar check-in.')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro na requisição: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Widget _buildField(Map<String, dynamic> question) {
    final String label = question['label'];
    final String type = question['type'];
    final bool required = question['required'] ?? false;

    switch (type) {
      case 'scale_1_10':
        double currentValue = (_answers[label] as num?)?.toDouble() ?? 5.0;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    label + (required ? ' *' : ''),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
                Text(
                  currentValue.toInt().toString(),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.indigoAccent,
                  ),
                ),
              ],
            ),
            Slider(
              value: currentValue,
              min: 1,
              max: 10,
              divisions: 9,
              activeColor: Colors.indigoAccent,
              label: currentValue.toInt().toString(),
              onChanged: (val) {
                setState(() {
                  _answers[label] = val;
                });
              },
            ),
          ],
        );

      case 'number':
        return TextFormField(
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            labelText: label + (required ? ' *' : ''),
            filled: true,
            fillColor: const Color(0xFF1E293B),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          validator: (val) {
            if (required && (val == null || val.isEmpty)) {
              return 'Campo obrigatório';
            }
            return null;
          },
          onSaved: (val) => _answers[label] = val != null ? num.tryParse(val) ?? val : '',
        );

      case 'text':
      default:
        return TextFormField(
          maxLines: 3,
          decoration: InputDecoration(
            labelText: label + (required ? ' *' : ''),
            filled: true,
            fillColor: const Color(0xFF1E293B),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          validator: (val) {
            if (required && (val == null || val.isEmpty)) {
              return 'Campo obrigatório';
            }
            return null;
          },
          onSaved: (val) => _answers[label] = val ?? '',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_formData?['title'] ?? 'Formulário do Treino'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _formData == null
              ? const Center(child: Text('Não foi possível carregar o formulário.'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Treino: ${widget.workoutTitle}',
                          style: const TextStyle(fontSize: 16, color: Colors.indigoAccent, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Responda às perguntas abaixo para confirmar sua presença:',
                          style: TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                        const SizedBox(height: 24),

                        // Renderiza dinamicamente as perguntas vindas do MongoDB
                        ...(_formData!['questions'] as List).map((q) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 20),
                            child: _buildField(q),
                          );
                        }).toList(),

                        const SizedBox(height: 12),

                        ElevatedButton(
                          onPressed: _isSubmitting ? null : _submitForm,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.indigo,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: _isSubmitting
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text(
                                  'Enviar e Confirmar Check-in',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }
}