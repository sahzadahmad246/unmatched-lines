// src/models/index.ts
import User from "./User";
import Poem from "./Poem";

// Reference models to ensure registration
export function registerModels() {
  return {
    User,
    Poem,
  };
}