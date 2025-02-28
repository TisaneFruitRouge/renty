import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="absolute bottom-6 left-6 right-6">
      <View className="bg-black/90 rounded-full overflow-hidden flex-row relative h-14 items-center justify-between px-5">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const icon = options.tabBarIcon;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }
          };

          return (
            <View key={route.key} className="relative">
              {isFocused && (
                <Animated.View 
                  entering={FadeIn.springify()
                    .mass(1)
                    .damping(15)
                    .stiffness(120)}
                  className="absolute -inset-1 bg-white/10 rounded-full"
                />
              )}
              <Pressable
                onPress={onPress}
                className="h-10 w-10 items-center justify-center"
              >
                {icon?.({ 
                  size: 24,
                  color: isFocused ? 'white' : 'rgba(255,255,255,0.5)',
                  focused: isFocused,
                })}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
