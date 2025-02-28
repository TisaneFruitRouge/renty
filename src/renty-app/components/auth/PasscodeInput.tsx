import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

interface PasscodeInputProps {
  passcodeDigits: string[];
}

export const PasscodeInput: React.FC<PasscodeInputProps> = ({ passcodeDigits }) => {
  return (
    <View className="flex-row justify-center items-center my-6 gap-3">
      {passcodeDigits.map((digit, index) => (
        <View 
          key={index} 
          className={cn(
            "w-5 h-5 rounded-full border border-gray-300 justify-center items-center",
            digit ? "border-black" : ""
          )}
        >
          {digit ? <View className="w-3 h-3 rounded-full bg-black" /> : null}
        </View>
      ))}
    </View>
  );
};
