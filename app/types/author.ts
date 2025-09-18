export interface Editorial {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  name: string;
  isbn: string;              // ojo: puede traer valores no numéricos o sin ceros a la izquierda
  image: string;
  publishingDate: string;    // ISO (YYYY-MM-DD)
  description: string;
  editorial: Editorial;
}

export interface Organization {
  id: number;
  name: string;
  tipo: string;              // e.g., "PUBLICA", "FUNDACION"
}

export interface Prize {
  id: number;
  premiationDate: string;    // ISO (YYYY-MM-DD)
  name: string;
  description: string;
  organization: Organization;
}

export interface Author {
  id: number;
  birthDate: string;         
  name: string;
  description: string;
  image: string;            
  prizes: Prize[];          
}
