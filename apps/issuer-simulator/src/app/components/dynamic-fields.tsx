import { Flex, TextField, Button, Text, Badge } from '@radix-ui/themes';

interface DynamicFieldsProps {
  fields: string[];
  onChange: (fields: string[]) => void;
}

export function DynamicFields({ fields, onChange }: DynamicFieldsProps) {
  const addField = () => onChange([...fields, '']);

  const updateField = (index: number, value: string) => {
    const next = [...fields];
    next[index] = value;
    onChange(next);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  return (
    <Flex direction="column" gap="3">
      <Flex align="center" gap="2">
        <Text size="2" weight="medium">
          Campos Adicionais
        </Text>
        <Badge variant="soft" color="gray" size="1">
          {fields.length}
        </Badge>
      </Flex>

      {fields.map((field, index) => (
        <Flex key={index} gap="2" align="center">
          <TextField.Root
            value={field}
            onChange={(e) => updateField(index, e.target.value)}
            placeholder={`Nome do campo ${index + 1}`}
            size="2"
            style={{ flex: 1 }}
          />
          <Button
            variant="ghost"
            color="red"
            size="1"
            onClick={() => removeField(index)}
          >
            Remover
          </Button>
        </Flex>
      ))}

      <Button variant="soft" size="1" onClick={addField}>
        + Adicionar Campo
      </Button>
    </Flex>
  );
}
