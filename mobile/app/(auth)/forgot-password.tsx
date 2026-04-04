import { useState } from "react";

export const options = { title: "Forgot password" };
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/lib/notifications/toast";

export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [email, setEmail] = useState("");

  return (
    <View className="flex-1 px-6 pt-4">
      <Text className="text-2xl font-bold text-slate-100 mb-2">Reset password</Text>
      <Text className="text-slate-400 mb-6">Placeholder — wire to your API later.</Text>
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Send reset link" onPress={() => toast.show("Reset email (mock) sent")} />
    </View>
  );
}
