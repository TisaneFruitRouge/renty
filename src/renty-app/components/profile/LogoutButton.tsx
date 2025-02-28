import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

export function LogoutButton() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Router will automatically redirect to login due to auth state change
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View className="px-5 pb-10">
      <TouchableOpacity 
        onPress={handleLogout}
        className="bg-white border border-red-100 rounded-xl p-4 flex-row items-center justify-center mt-4"
      >
        <MaterialIcons name="logout" size={20} color="#ef4444" />
        <Text className="ml-2 text-red-500 font-medium">
          {t('profile.logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
