import type { BowtieDiagram } from "../domain/bowtie.types";

/**
 * Export a Bowtie diagram to JSON file for download
 */
export function exportDiagramToJSON(diagram: BowtieDiagram): void {
  try {
    const json = JSON.stringify(diagram, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Generate filename with sanitized title and timestamp
    const sanitizedTitle = diagram.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    a.download = `bowtie-${sanitizedTitle}-${timestamp}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export diagram:", error);
    throw new Error("Failed to export diagram to JSON");
  }
}

/**
 * Import a Bowtie diagram from a JSON file
 */
export function importDiagramFromJSON(file: File): Promise<BowtieDiagram> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validate the imported data
        const validation = validateImportedJSON(parsed);
        if (!validation.valid) {
          reject(new Error(`Invalid diagram file: ${validation.errors?.join(", ")}`));
          return;
        }
        
        resolve(validation.diagram!);
      } catch (error) {
        reject(new Error("Failed to parse JSON file"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate imported JSON data to ensure it's a valid BowtieDiagram
 */
export function validateImportedJSON(data: unknown): {
  valid: boolean;
  diagram?: BowtieDiagram;
  errors?: string[];
} {
  const errors: string[] = [];
  
  // Check if data is an object
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Data must be an object"] };
  }
  
  const obj = data as Record<string, unknown>;
  
  // Required fields
  if (!obj.id || typeof obj.id !== "string") {
    errors.push("Missing or invalid 'id' field");
  }
  if (!obj.title || typeof obj.title !== "string") {
    errors.push("Missing or invalid 'title' field");
  }
  if (!Array.isArray(obj.nodes)) {
    errors.push("Missing or invalid 'nodes' array");
  }
  if (!Array.isArray(obj.edges)) {
    errors.push("Missing or invalid 'edges' array");
  }
  
  // Validate nodes array
  if (Array.isArray(obj.nodes)) {
    obj.nodes.forEach((node, index) => {
      if (!node || typeof node !== "object") {
        errors.push(`Node at index ${index} is not an object`);
        return;
      }
      const n = node as Record<string, unknown>;
      if (!n.id || typeof n.id !== "string") {
        errors.push(`Node at index ${index} missing 'id'`);
      }
      if (!n.type || typeof n.type !== "string") {
        errors.push(`Node at index ${index} missing 'type'`);
      }
      if (!n.label || typeof n.label !== "string") {
        errors.push(`Node at index ${index} missing 'label'`);
      }
    });
  }
  
  // Validate edges array
  if (Array.isArray(obj.edges)) {
    obj.edges.forEach((edge, index) => {
      if (!edge || typeof edge !== "object") {
        errors.push(`Edge at index ${index} is not an object`);
        return;
      }
      const e = edge as Record<string, unknown>;
      if (!e.id || typeof e.id !== "string") {
        errors.push(`Edge at index ${index} missing 'id'`);
      }
      if (!e.source || typeof e.source !== "string") {
        errors.push(`Edge at index ${index} missing 'source'`);
      }
      if (!e.target || typeof e.target !== "string") {
        errors.push(`Edge at index ${index} missing 'target'`);
      }
    });
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, diagram: obj as unknown as BowtieDiagram };
}

/**
 * Save diagram to localStorage with SSR safety
 */
export function saveDiagramToLocalStorage(diagram: BowtieDiagram, key: string = "bowtie.diagram.autosave"): void {
  if (typeof window === "undefined") return;
  
  try {
    const json = JSON.stringify(diagram);
    window.localStorage.setItem(key, json);
  } catch (error) {
    console.warn("Failed to save diagram to localStorage:", error);
  }
}

/**
 * Load diagram from localStorage with SSR safety
 */
export function loadDiagramFromLocalStorage(key: string = "bowtie.diagram.autosave"): BowtieDiagram | null {
  if (typeof window === "undefined") return null;
  
  try {
    const json = window.localStorage.getItem(key);
    if (!json) return null;
    
    const parsed = JSON.parse(json);
    const validation = validateImportedJSON(parsed);
    
    if (!validation.valid) {
      console.warn("Invalid diagram in localStorage:", validation.errors);
      return null;
    }
    
    return validation.diagram!;
  } catch (error) {
    console.warn("Failed to load diagram from localStorage:", error);
    return null;
  }
}

/**
 * Clear diagram from localStorage
 */
export function clearDiagramFromLocalStorage(key: string = "bowtie.diagram.autosave"): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear diagram from localStorage:", error);
  }
}

