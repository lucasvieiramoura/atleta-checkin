import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  Map<String, dynamic>? _user;

  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get user => _user;

  AuthProvider() {
    _checkToken();
  }

  Future<void> _checkToken() async {
    final token = await ApiService.getToken();
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');

    if (token != null && userStr != null) {
      _user = jsonDecode(userStr);
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await ApiService.login(email, password);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();

        await prefs.setString('tokne', data['token']);
        await prefs.setString('user', jsonEncode(data['user']));

        _user = data['user'];
        _isAuthenticated = true;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Erro no login: $e');
    }
    return false;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _isAuthenticated = false;
    _user = null;
    notifyListeners();
  }
}