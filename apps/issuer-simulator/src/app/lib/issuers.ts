export interface IssuerConfig {
  id: string;
  partnerId: string;
  name: string;
  partnerName: string;
}

export const ISSUERS: IssuerConfig[] = [
  {
    id: 'e4f5a6b7-c8d9-0123-def0-34567890abcd',
    partnerId: 'd3e4f5a6-b7c8-9012-cdef-234567890abc',
    name: 'Alpha Credenciais',
    partnerName: 'Banco Digital Alpha',
  },
  {
    id: 'a6b7c8d9-e0f1-2345-f012-567890abcdef',
    partnerId: 'f5a6b7c8-d9e0-1234-ef01-4567890abcde',
    name: 'Beta Verificacao',
    partnerName: 'Fintech Beta',
  },
];
