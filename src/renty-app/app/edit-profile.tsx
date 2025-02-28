import { Text } from '@/components/ui/text';
import { View, Image, Animated, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { Label } from '@/components/ui/label';
import { updateTenant } from '@/queries/profile';
import { EditProfileForm, editProfileSchema } from '@/schemas/profile';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { tenant, setTenant } = useAuth();
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [activeSection, setActiveSection] = useState('basic'); // 'basic' or 'contact'
  const scrollY = useRef(new Animated.Value(0)).current;

  const { control, handleSubmit, formState: { errors } } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: tenant?.firstName || '',
      lastName: tenant?.lastName || '',
      email: tenant?.email || '',
      phoneNumber: tenant?.phoneNumber || '',
    },
  });

  const onSubmit = async (data: EditProfileForm) => {
    try {
      // Here we'll add email/phone verification logic later
      const result = await updateTenant(data);
      
      // Update the tenant in the auth context
      if (result.tenant) {
        setTenant({
          ...tenant!,
          ...result.tenant,
          property: tenant?.property! || result.tenant.property!
        });
      }
      
      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Header animation based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 60],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Animated Header */}
      <Animated.View 
        style={{
          height: headerHeight,
          opacity: headerOpacity,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
          paddingTop: 40,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">{t('profile.edit.title')}</Text>
        <View style={{ width: 24 }} />
      </Animated.View>
      
      <ScrollView 
        className="flex-1 bg-background" 
        contentInsetAdjustmentBehavior="automatic"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Profile Header with Avatar */}
        <View className="w-full pt-24 pb-12 px-6 items-center bg-gradient-to-b from-gray-50 to-gray-100">
          <View className="rounded-full h-28 w-28 bg-white shadow-lg overflow-hidden border-4 border-white mb-5">
            {tenant?.avatarUrl ? (
              <Image 
                source={{ uri: tenant.avatarUrl }} 
                className="w-full h-full" 
                resizeMode="cover" 
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-primary/5">
                <Text className="text-4xl font-bold text-primary">
                  {tenant?.firstName?.charAt(0)}{tenant?.lastName?.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-primary text-2xl font-bold">
            {tenant?.firstName} {tenant?.lastName}
          </Text>
          <Text className="text-gray-500 text-sm mt-2">
            {tenant?.email}
          </Text>
        </View>
        
        {/* Tab Navigation */}
        <View className="flex-row border-b border-gray-200 bg-white">
          <TouchableOpacity 
            className={`flex-1 py-4 items-center ${activeSection === 'basic' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveSection('basic')}
          >
            <Text className={`font-medium ${activeSection === 'basic' ? 'text-primary' : 'text-gray-600'}`}>
              {t('profile.edit.basicInfo')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-4 items-center ${activeSection === 'contact' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveSection('contact')}
          >
            <Text className={`font-medium ${activeSection === 'contact' ? 'text-primary' : 'text-gray-600'}`}>
              {t('profile.edit.contactInfo')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="p-6 space-y-6">
          {/* Basic Information Section */}
          {activeSection === 'basic' && (
            <View className="space-y-6">
              <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                <View className="p-5 space-y-5">
                  <View className="space-y-3">
                    <Controller
                      control={control}
                      name="firstName"
                      render={({ field: { onChange, value } }) => (
                        <View>
                          <Label nativeID='firstName' className="text-sm text-gray-500 mb-1">
                            {t('profile.edit.firstName')}
                          </Label>
                          <Input
                            onChangeText={onChange}
                            value={value}
                            className="bg-gray-50 border-gray-200 rounded-lg text-base"
                            placeholder="John"
                          />
                        </View>
                      )}
                    />
                  </View>
                  
                  <View className="space-y-3">
                    <Controller
                      control={control}
                      name="lastName"
                      render={({ field: { onChange, value } }) => (
                        <View>
                          <Label nativeID='lastName' className="text-sm text-gray-500 mb-1">
                            {t('profile.edit.lastName')}
                          </Label>
                          <Input
                            onChangeText={onChange}
                            value={value}
                            className="bg-gray-50 border-gray-200 rounded-lg text-base"
                            placeholder="Doe"
                          />
                        </View>
                      )}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
          
          {/* Contact Information Section */}
          {activeSection === 'contact' && (
            <View className="space-y-6">
              <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                <View className="p-5 space-y-5">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <View className="space-y-3">
                        <View className="flex-row justify-between items-center">
                          <Label nativeID='email' className="text-sm text-gray-500">
                            {t('profile.edit.email')}
                          </Label>
                          {tenant?.emailVerified && (
                            <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                              <MaterialIcons name="verified" size={14} color="#22c55e" />
                              <Text className="text-xs text-green-700 ml-1">{t('profile.edit.verified')}</Text>
                            </View>
                          )}
                        </View>
                        <View>
                          <Input
                            onChangeText={onChange}
                            value={value}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="bg-gray-50 border-gray-200 rounded-lg text-base pr-20"
                            placeholder="email@example.com"
                          />
                          {!tenant?.emailVerified && (
                            <TouchableOpacity 
                              className="absolute right-3 top-2.5 bg-primary/10 px-3 py-1.5 rounded-full"
                              onPress={() => setVerifyingEmail(true)}
                            >
                              <Text className="text-xs font-medium text-primary">{t('profile.edit.verify')}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  />
                  
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, value } }) => (
                      <View className="space-y-3">
                        <View className="flex-row justify-between items-center">
                          <Label nativeID='phone' className="text-sm text-gray-500">
                            {t('profile.edit.phone')}
                          </Label>
                          {tenant?.phoneVerified && (
                            <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                              <MaterialIcons name="verified" size={14} color="#22c55e" />
                              <Text className="text-xs text-green-700 ml-1">{t('profile.edit.verified')}</Text>
                            </View>
                          )}
                        </View>
                        <View>
                          <Input
                            onChangeText={onChange}
                            value={value}
                            keyboardType="phone-pad"
                            className="bg-gray-50 border-gray-200 rounded-lg text-base pr-20"
                            placeholder="+33 6 12 34 56 78"
                          />
                          {!tenant?.phoneVerified && (
                            <TouchableOpacity 
                              className="absolute right-3 top-2.5 bg-primary/10 px-3 py-1.5 rounded-full"
                              onPress={() => setVerifyingPhone(true)}
                            >
                              <Text className="text-xs font-medium text-primary">{t('profile.edit.verify')}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View>
            </View>
          )}
          
          {/* Action Buttons */}
          <View className="flex flex-col gap-2 mt-4">
            <Button
              onPress={handleSubmit(onSubmit)}
              className="w-full bg-primary rounded-xl py-4"
            >
              <Text className="text-white font-bold text-base">{t('profile.edit.save')}</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="w-full border-gray-300 rounded-xl py-4"
            >
              <Text className="font-medium text-base">{t('profile.edit.cancel')}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}