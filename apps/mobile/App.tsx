
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { Home, Wallet, Calendar, CheckSquare } from 'lucide-react-native';

// --- Placeholder Screens (Adapte seus componentes Web para React Native aqui) ---

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LifeSync AI</Text>
      <Text style={styles.subtitle}>Painel Mobile</Text>
      {/* Aqui viria o Dashboard.tsx adaptado com <View> e <Text> */}
    </View>
  );
}

function FinanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finanças</Text>
      {/* Adaptação do Finance.tsx */}
    </View>
  );
}

function AgendaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>
      {/* Adaptação do Agenda.tsx */}
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let icon;
              if (route.name === 'Painel') icon = <Home color={color} size={size} />;
              else if (route.name === 'Finanças') icon = <Wallet color={color} size={size} />;
              else if (route.name === 'Agenda') icon = <Calendar color={color} size={size} />;
              return icon;
            },
            tabBarActiveTintColor: '#4f46e5',
            tabBarInactiveTintColor: 'gray',
            headerShown: false
          })}
        >
          <Tab.Screen name="Painel" component={HomeScreen} />
          <Tab.Screen name="Finanças" component={FinanceScreen} />
          <Tab.Screen name="Agenda" component={AgendaScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8
  }
});
