import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const kBgPrimary = Color(0xFF070B14);
const kBgSecondary = Color(0xFF0D1526);
const kBgCard = Color(0xFF111827);
const kBorder = Color(0xFF1E2D45);
const kAccentBlue = Color(0xFF3B82F6);
const kAccentCyan = Color(0xFF06B6D4);
const kAccentPurple = Color(0xFF8B5CF6);
const kAccentGreen = Color(0xFF10B981);
const kAccentAmber = Color(0xFFF59E0B);
const kAccentRed = Color(0xFFEF4444);
const kTextPrimary = Color(0xFFF0F4FF);
const kTextSecondary = Color(0xFF8B9AB8);
const kSlate400 = Color(0xFF94A3B8);
const kSlate500 = Color(0xFF64748B);
const kSlate600 = Color(0xFF475569);
const kSlate700 = Color(0xFF334155);
const kSlate800 = Color(0xFF1E293B);
const kSlate900 = Color(0xFF0F172A);

ThemeData buildTheme() {
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: kBgPrimary,
    colorScheme: const ColorScheme.dark(
      primary: kAccentBlue,
      secondary: kAccentCyan,
      surface: kBgCard,
      onPrimary: kTextPrimary,
      onSecondary: kTextPrimary,
      onSurface: kTextPrimary,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).apply(
      bodyColor: kTextPrimary,
      displayColor: kTextPrimary,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: kBgPrimary,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      titleTextStyle: TextStyle(color: kTextPrimary, fontSize: 14, fontWeight: FontWeight.w600),
      iconTheme: IconThemeData(color: kSlate400),
    ),
    dividerColor: kBorder,
    cardTheme: const CardThemeData(
      color: kBgCard,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
        side: BorderSide(color: kBorder),
      ),
    ),
  );
}
