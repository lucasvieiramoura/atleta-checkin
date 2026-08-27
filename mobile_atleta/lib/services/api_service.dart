import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
    // Use http://10.0.0.2:3000/api para Emulador ou IP Local do PC dos dispositivo
    static const String baseUrl = 'http://localhost:3000/api';

    static Future<String?> getToken() async {
        final prefs = await SharedPreferences.getInstance();
        return prefs.getString('token');
    }

    static Future<Map<String, String>> _getHeaders() async {
        final token = await getToken();
        return {
            'Content-Type':'application/json',
            if (token != null ) 'Authorization':'Bearer $token',
        };
    }

    // Autenticação
    static Future<http.Response> login(String email, String password) async {
        return await http.post(
            Uri.parse('$baseUrl/auth/login'),
            headers: {'Content-Type':'application/json'},
            body: jsonEncode({'email':email, 'password': password}),
        );
    }

    // Buscar Treinos
    static Future<http.Response> getWorkouts() async {
        final headers = await _getHeaders();
        return await http.get(Uri.parse('$baseUrl/workouts'), headers: headers);
    }

    // Buscar Formulário por ID
    static Future<http.Response> getFormById(String formId) async {
        final headers = await _getHeaders();
        return await http.get(Uri.parse('$baseUrl/forms/$formId'), headers: headers);
    }

    // Confirmar Presença (Check-in)
    static Future<http.Response> sendCheckIn(String workoutId, List<Map<String, dynamic>> formAnswer) async {
        final headers = await _getHeaders();
        return await http.post(
            Uri.parse('$baseUrl/attendance/checkin'),
            headers: headers,
            body: jsonEncode({
                'workoutId': workoutId,
                'formAnswers': formAnswer,
            }),
        );
    }

}