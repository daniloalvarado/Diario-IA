import { Redirect } from 'expo-router';

export default function OAuthCallback() {
  // Simplemente redirige al usuario a la pantalla de inicio ("/")
  return <Redirect href="/" />;
}