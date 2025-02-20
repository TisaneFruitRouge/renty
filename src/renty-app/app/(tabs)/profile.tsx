
import { Text } from '@/components/ui/text';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView>
      <View>
        <Text>profile</Text>
      </View>
    </ScrollView>
  );
}