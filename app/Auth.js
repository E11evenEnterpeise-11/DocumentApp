import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DropDownPicker from "react-native-dropdown-picker";
import Main from "./main";
import { FIREBASE_AUTH } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

function Login() {
  const navigation = useNavigation();
  //useState to collect data for auth
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, pass);
      console.log(response);
      navigation.navigate("Main");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  //maing colors are white, grey and dark blue
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#36454F",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 300,
          height: 400,
          backgroundColor: "#B2BEB5",
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            alignItems: "center",
            color: "white",
          }}
        >
          LOG IN
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            alignItems: "center",
            color: "black",
            marginTop: 10,
          }}
        >
          Email
        </Text>
        <TextInput
          placeholder="YourEmail@gmail.com"
          style={{
            backgroundColor: "rgb(220,220,220)",
            width: "80%",
            height: "15%",
            borderRadius: 100,
            paddingHorizontal: 20,
          }}
          onChangeText={(val) => setEmail(val)}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            alignItems: "center",
            color: "black",
            marginTop: 10,
          }}
        >
          Password
        </Text>
        <TextInput
          placeholder="Password......"
          secureTextEntry={true}
          style={{
            backgroundColor: "rgb(220,220,220)",
            width: "80%",
            height: "15%",
            borderRadius: 100,
            paddingHorizontal: 20,
          }}
          onChangeText={(val) => setPass(val)}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#000ff" />
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: "black",
              height: 50,
              width: 100,
              borderRadius: 10,
              justifyContent: "center",
              paddingLeft: 35,
              marginTop: 20,
            }}
            onPress={signIn}
          >
            <AntDesign name="rightcircle" size={24} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{
            marginTop: 10,
          }}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={{ color: "blue" }}>
            Don't have an account,{" "}
            <Text style={{ fontWeight: "bold" }}>SIGN UP</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SignUp() {
  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const [name, setName] = useState();
  const [num, setNum] = useState();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Staff", value: "Staff" },
    { label: "Student", value: "Student" },
  ]);
  const navigation = useNavigation();
  const auth = FIREBASE_AUTH;

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, pass);
      console.log(response);
      addDataInfo();
      navigation.navigate("Main");
    } catch (error) {
      console.log(error);
    } finally {
      console.log("ended");
    }
  };

  const addDataInfo = async () => {
    try {
      const docRef = await addDoc(collection(FIREBASE_STORE, "all"), {
        //add a location field in db
        name: name,
        status: value,
        phoneNo: num,
        email: email,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#36454F",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 300,
          height: 600,
          backgroundColor: "#B2BEB5",
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            alignItems: "center",
            color: "white",
          }}
        >
          SIGN UP
        </Text>
        <TextInput
          placeholder="Full Name"
          style={{
            backgroundColor: "rgb(220,220,220)",
            width: 250,
            height: 50,
            borderRadius: 20,
            padding: 10,
          }}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          placeholder="Youremail@gmail.com"
          style={{
            backgroundColor: "rgb(220,220,220)",
            width: 250,
            height: 50,
            borderRadius: 20,
            padding: 10,
            marginTop: 10,
          }}
          onChangeText={(text) => setEmail(text)}
        />

        <TextInput
          placeholder="Phone Number"
          style={{
            backgroundColor: "rgb(220,220,220)",
            width: 250,
            height: 50,
            borderRadius: 20,
            padding: 10,
            marginTop: 10,
          }}
          onChangeText={(text) => setNum(text)}
        />
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          style={{
            backgroundColor: "rgb(220,220,220)",
            width: "80%",
            height: "10%",
            borderRadius: 100,
            paddingHorizontal: 20,
            marginTop: 10,
            marginLeft: 30,
            alignItems: "center",
          }}
        />
        <TextInput
          placeholder="Enter your Password"
          style={{
            backgroundColor: "rgb(220,220,220)",
            width: 250,
            height: 50,
            borderRadius: 20,
            padding: 10,
            marginTop: 10,
          }}
          onChangeText={(text) => setPass(text)}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#36454F",
            height: 50,
            width: 100,
            borderRadius: 10,
            justifyContent: "center",
            paddingLeft: 35,
            marginTop: 20,
          }}
          onPress={() => signUp()}
        >
          <AntDesign name="rightcircle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ color: "blue" }}>
            Already have an account
            <Text style={{ fontWeight: "bold" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function Auth() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={SignUp} />
        <Stack.Screen name="Main" component={Main} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
