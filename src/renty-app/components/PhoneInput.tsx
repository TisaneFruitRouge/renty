import { Input } from './ui/input';

interface PhoneInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export const PhoneInput = ({ value, onChange, placeholder }: PhoneInputProps) => (
  <Input 
    value={value}
    onChangeText={onChange}
    placeholder={placeholder || "+XX.XX.XX.XX.XX"}
    keyboardType="phone-pad"
  />
);