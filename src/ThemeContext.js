/**
 * ThemeContext.js
 * Extracted from App.js to break the App ↔ Navbar circular dependency.
 * Import ThemeContext from here instead of from App.
 */
import { createContext } from "react";

export const ThemeContext = createContext();