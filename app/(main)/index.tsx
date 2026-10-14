import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export default function Placeholder() {
  return (
    <Box className="flex-1 items-center justify-center bg-background p-6">
      <Heading size="2xl">DPS Vet</Heading>
      <Text>Foundation ready.</Text>
    </Box>
  );
}
