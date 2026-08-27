import 'dart:convert';
import 'dart:ui_web';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'form_dynamic.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  List<dynamic> _allWorkouts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _fetchWorkouts();
  }

  Future<void> _fetchWorkouts() async {
    setState(() => _isLoading =true);
    try {
      final response = await ApiService.getWorkouts();
      if (response.statusCode == 200) {
        setState(() {
          _allWorkouts = jsonDecode(response.body);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar treinos: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // Filtra os treinos do dia selecinado
  List<dynamic> _getWorkoutsForDay(DateTime day) {
    return _allWorkouts.where((workout) {
      final workoutDate = DateTime.parse(workout['date']);
      return isSameDay(workoutDate, day);
    }).toList();
  }

  void _handleCheckIn(Map<String, dynamic> workout) async {
    final formId = workout['formId'];

    // Se o treino tem um formulário atrelado, navega para a teal de preenchimento
    if (formId != null && formId.toString().isNotEmpty) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => FormDynamicScreen(
            workoutId: workout['_id'],
            formId: formId,
            workoutTitle: workout['title']
          ),
        ),
      ).then((_) => _fetchWorkouts());
    } else { 
      try {
        final response = await ApiService.sendCheckIn(workout['_id'],[]);
        if (response.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Presença confirmada com sucesso!')),
          );
          _fetchWorkouts();
        } else {
          final err = jsonDecode(response.body);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err['message'] ?? 'Erro no check-in')),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro na conexão: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final selectedWorkouts = _selectedDay != null ? _getWorkoutsForDay(_selectedDay!) : [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Agenda de Treinos'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authProvider.logout(),
          ),
        ],
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : Column(
          children: [
            //Calendário
            TableCalendar(
              firstDay: DateTime.utc(2026,1,1),
              lastDay: DateTime.utc(2027,12,12),
              focusedDay: _focusedDay,
              calendarFormat: _calendarFormat,
              selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
              eventLoader: _getWorkoutsForDay,
              onDaySelected: (selectedDay, focusedDay) {
                setState(() {
                  _selectedDay = selectedDay;
                  _focusedDay = focusedDay;
                });
              },
              onFormatChanged: (format) {
                setState(() => _calendarFormat = format);
              },
              calendarStyle: CalendarStyle(
                todayDecoration: BoxDecoration(
                  color: Colors.indigo.withOpacity(0.5),
                  shape: BoxShape.circle
                ),
                selectedDecoration: const BoxDecoration(
                  color: Colors.indigo,
                  shape: BoxShape.circle,
                ),
                markerDecoration: const BoxDecoration(
                  color: Colors.greenAccent,
                  shape: BoxShape.circle
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Cabeçado do Dia
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              width: double.infinity,
              color: const Color(0xFF1E293B),
              child: Text(
                _selectedDay != null
                  ? 'Treinos para ${DateFormat('dd/MM/yyyy').format(_selectedDay!)}'
                  : 'Selecione uma data',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),

            // Lista de Treinos no dia selecionado
            Expanded(
              child: selectedWorkouts.isEmpty
                ? const Center(
                  child: Text(
                    'Nenhum treino agendado para este dia',
                    style: TextStyle(color: Colors.grey),
                  ),
                )
                : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: selectedWorkouts.length,
                  itemBuilder: (context, index){
                    final workout = selectedWorkouts[index];
                    final dateParsed = DateTime.parse(workout['date']);
                    final hasForm = workout['formId'] != null;

                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children:[
                                Text(
                                  workout['title'],
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.indigoAccent
                                  ),
                                ),
                                if (hasForm)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal:8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'Formulário',
                                      style: TextStyle(color: Colors.amber, fontSize: 10),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              workout['description'] ?? 'Sem descrição',
                              style: const TextStyle(color: Colors.grey),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 16, color: Colors.indigoAccent),
                                    const SizedBox(width: 4),
                                    Text(
                                      DateFormat('HH:mm').format(dateParsed),
                                      style: const TextStyle(fontSize: 14),
                                    ),
                                  ],
                                ),
                                ElevatedButton.icon(
                                  onPressed: () => _handleCheckIn(workout),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.indigo,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8)
                                    ),
                                  ),
                                  icon: const Icon(Icons.check_circle_outline, size: 18),
                                  label: Text(hasForm ? 'Preencher & Check-in' : 'Confirmar Presença'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                )
            ),
          ],
        ),
    );
  }
}