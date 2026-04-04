import { useRouter } from "expo-router";

export const options = { title: "Create account" };
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { registerAccount } from "@/lib/api/register";
import { useToast } from "@/lib/notifications/toast";
import { useAuthStore } from "@/stores/authStore";

const NOTICE_CHANNEL_EMAIL = "email";

export default function SignUpScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [noticeTarget, setNoticeTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <View className="flex-1 px-6 pt-4">
      <Text className="text-2xl font-bold text-slate-100 mb-6">Create account</Text>
      <TextField label="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextField label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextField
        label="Notice target"
        autoCapitalize="none"
        keyboardType="email-address"
        value={noticeTarget}
        onChangeText={setNoticeTarget}
        placeholder="Defaults to email if empty"
      />
      <Button
        title={submitting ? "Signing up…" : "Sign up"}
        disabled={submitting}
        className="mt-2"
        onPress={async () => {
          if (submitting) return;
          const target = noticeTarget.trim() || email.trim();
          if (!username.trim() || !email.trim() || !password || !phone.trim() || !target) {
            toast.show("Fill username, email, password, phone, and notice target (or leave target empty to use email).");
            return;
          }
          setSubmitting(true);
          try {
            const session = await registerAccount({
              username: username.trim(),
              password,
              email: email.trim(),
              phone: phone.trim(),
              noticeChannel: NOTICE_CHANNEL_EMAIL,
              noticeTarget: target,
            });
            if (session) {
              signIn(session);
              toast.show("Welcome!");
              router.replace("/(app)/(tabs)");
            } else {
              toast.show("Account created. Please sign in.");
              router.replace("/(auth)/login");
            }
          } catch (e) {
            toast.show(e instanceof Error ? e.message : "Sign up failed");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </View>
  );
}
