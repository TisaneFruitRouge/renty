import MaskInput from 'react-native-mask-input';
import { Input } from './ui/input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = ({ value, onChange }: PhoneInputProps) => (
  // <MaskInput
  //   value={value}
  //   onChangeText={onChange}
  //   mask={['+', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/]}
  //   keyboardType="numeric"
  //   placeholder="+XX XXX XXX XXX"
  // />
  <Input 
    value={value}
    onChangeText={onChange}
    placeholder="XX.XX.XX.XX.XX"
    keyboardType="phone-pad"
  />
);