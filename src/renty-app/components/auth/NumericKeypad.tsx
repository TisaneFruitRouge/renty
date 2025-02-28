import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface NumericKeypadProps {
  onKeyPress: (key: string | number) => void;
  disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({ 
  onKeyPress, 
  disabled = false 
}) => {
  return (
    <View className="flex-row flex-wrap justify-center w-4/5 mt-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'].map((key, index) => {
        if (key === '') {
          return <View key={index} className="w-1/3 h-[70px] justify-center items-center p-2.5" />;
        }
        
        if (key === 'delete') {
          return (
            <TouchableOpacity 
              key={index} 
              className="w-1/3 h-[70px] justify-center items-center p-2.5"
              onPress={() => onKeyPress(key)}
              disabled={disabled}
            >
              <IconSymbol name="delete-left" size={24} color="#333" />
            </TouchableOpacity>
          );
        }
        
        return (
          <TouchableOpacity 
            key={index} 
            className="w-1/3 h-[70px] justify-center items-center p-2.5"
            onPress={() => onKeyPress(key)}
            disabled={disabled}
          >
            <Text className="text-[28px] font-normal">{key}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
