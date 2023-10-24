import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { AntDesign, Entypo, Ionicons, Zocial } from "@expo/vector-icons";
import { useNavigation, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  getCountFromServer,
  where,
} from "firebase/firestore";
import { FIREBASE_APP, FIREBASE_STORAGE, FIRE_STORE } from "../firebaseConfig";
import * as DocumentPicker from "expo-document-picker";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";

//install documentPicker
function Dashboard() {
  const [numP, setNumP] = useState();
  const [numC, setNumC] = useState();
  const [numS, setNumS] = useState();
  const [numST, setNumST] = useState();

  const list = [
    { name: "Number of Project", num: numP, key: 1 },
    { name: "Number Of Contacts", num: numC, key: 2 },
    { name: "Number Of Staffs", num: numS, key: 3 },
    { name: "Number of Students", num: numST, key: 4 },
  ];

  useEffect(() => {
    readDoc();
    readCo();
    readS();
    readST();
  }, []);

  const readDoc = async () => {
    try {
      const todoRef = collection(FIRE_STORE, "documents");
      //Total number of documents
      const snapshot = await getCountFromServer(todoRef);
      setNumP(snapshot.data().count);
      console.log("project count: ", snapshot.data().count);
    } catch (error) {
      console.log(error);
    }
  };

  const readCo = async () => {
    try {
      const todoRef = collection(FIRE_STORE, "all");
      //Total number of documents

      const snapshot = await getCountFromServer(todoRef);
      setNumC(snapshot.data().count);
      console.log("contact count: ", snapshot.data().count);
    } catch (error) {
      console.log(error);
    }
  };

  const readS = async () => {
    try {
      const todoRef = collection(FIRE_STORE, "all");
      //Total number of documents
      const q = query(todoRef, where("status", "==", "Staff"));
      const snapShot = await getCountFromServer(q);
      setNumS(snapShot.data().count);
      console.log("staff count: ", snapShot.data().count);
    } catch (error) {
      console.log(error);
    }
  };

  const readST = async () => {
    try {
      const todoRef = collection(FIRE_STORE, "all");
      //Total number of documents
      const q = query(todoRef, where("status", "==", "Student"));
      const snapShot = await getCountFromServer(q);
      setNumST(snapShot.data().count);
      console.log("student count: ", snapShot.data().count);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <FlatList
        data={list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              width: 160,
              height: 170,
              backgroundColor: "#36454F",
              margin: 10,
              padding: 10,
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "600",
                color: "white",
                marginTop: 30,
                marginLeft: 50,
              }}
            >
              {item.num}
            </Text>
          </TouchableOpacity>
        )}
        numColumns={2}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}

function Project() {
  const [load, setLoad] = useState(false);
  const [fileName, setFileName] = useState();
  const [blodFile, setBlodFile] = useState();
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const todoRef = collection(FIRE_STORE, "documents");

    const subscriber = onSnapshot(todoRef, {
      next: (snapshot) => {
        console.log("Updated");

        const todos = [];
        snapshot.docs.forEach((doc) => {
          todos.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setTodos(todos);
        setLoad(true);
      },
    });

    return () => subscriber();
  }, []);

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync();
    if (result != null) {
      const f = result.assets;
      const r = await fetch(f[0].uri);
      const b = await r.blob();
      setFileName(f[0].name);
      setBlodFile(b);
      console.log(fileName);
      UploadFile();
      //setIsChoosed(true)
    }
  };

  const UploadFile = () => {
    if (!blodFile) return;
    const sotrageRef = ref(FIREBASE_STORAGE, `myDocs/${fileName}`); //LINE A
    const uploadTask = uploadBytesResumable(sotrageRef, blodFile); //LINE BuploadTask.on(
    uploadTask.on(
      "state_changed",
      null,
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          storeFile(fileName, downloadURL);
          console.log("File available at", downloadURL);
          return <ActivityIndicator />;
        });
      }
    );
  };

  const storeFile = async (name, uri) => {
    try {
      const docRef = await addDoc(collection(FIRE_STORE, "documents"), {
        //add a location field in db
        name: name,
        uri: uri,
      });
      alert("Successful uploaded");
    } catch (error) {
      console.log(error);
    }
  };

  const downloadFile = async (fName, uri) => {
    const result = await FileSystem.downloadAsync(
      uri,
      FileSystem.documentDirectory + fName
    );
    console.log(result);

    save(result.uri, fName, result.headers["content-type"]);
  };

  const save = async (url, filename, mimetype) => {
    if (Platform.OS === "android") {
      const Permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (Permission.granted) {
        const base64 = await FileSystem.readAsStringAsync(url, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.createFileAsync(
          Permission.directoryUri,
          filename,
          mimetype
        ).then(async (url) => {
          await FileSystem.writeAsStringAsync(url, base64, {
            encoding: FileSystem.EncodingType.Base64,
          }).catch((e) => console.log(e));
        });
      } else {
        shareAsync(url);
      }
    } else {
      shareAsync(url);
    }
  };

  /*
    connect to storage
      flatlist of document from firebase storage...
      add floating button...done
      pdf viewer onPress document...done
      */
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        {load ? (
          <FlatList
            data={todos}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  width: 300,
                  height: 150,
                  backgroundColor: "#36454F",
                  margin: 10,
                  padding: 10,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() =>
                  IntentLauncher.startActivityAsync(
                    "android.intent.action.VIEW",
                    {
                      data: item.uri,
                      flags: 1,
                      type: "application/pdf",
                    }
                  )
                }
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      color: "white",
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    {item.name}
                  </Text>
                  {/*download icon */}
                  <TouchableOpacity
                    style={{ marginLeft: 100 }}
                    onPress={() => downloadFile(item.name, item.uri)}
                  >
                    <Entypo name="download" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <ActivityIndicator />
        )}
      </View>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          boderColor: "red",
          alignItems: "center",
          justifyContent: "center",
          width: 70,
          position: "absolute",
          top: "85%",
          right: 20,
          height: 70,
          bachgroundColor: "red",
          borderRadius: 100,
        }}
        onPress={pickDocument}
      >
        <AntDesign name="pluscircle" size={24} color="#36454F" />
      </TouchableOpacity>
    </View>
  );
}

function Contact() {
  const [todos, setTodos] = useState([]);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const todoRef = collection(FIRE_STORE, "all");

    const subscriber = onSnapshot(todoRef, {
      next: (snapshot) => {
        console.log("Updated");

        const todos = [];
        snapshot.docs.forEach((doc) => {
          todos.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setTodos(todos);
        setLoad(true);
      },
    });

    return () => subscriber();
  }, []);

  /*
      flatlist of contact info with position attached
      */
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {load ? (
        <FlatList
          data={todos}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                width: 300,
                height: 150,
                backgroundColor: "#36454F",
                margin: 10,
                padding: 10,
                borderRadius: 20,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Ionicons name="person" size={24} color="white" />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "white",
                    marginTop: 2,
                    marginLeft: 10,
                  }}
                >
                  {item.name}
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Zocial name="statusnet" size={24} color="white" />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "white",
                    marginTop: 2,
                    marginLeft: 10,
                  }}
                >
                  {item.status}
                </Text>
              </View>
              <View style={{ flexDirection: "row", margin: 5 }}>
                <Entypo name="email" size={24} color="white" style={{}} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "white",
                    marginTop: 2,
                    marginLeft: 10,
                  }}
                >
                  {item.email}
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <AntDesign name="phone" size={24} color="white" />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "white",
                    marginTop: 2,
                    marginLeft: 10,
                  }}
                >
                  {item.phoneNo}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TAB() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="DashBoard"
        component={Dashboard}
        options={{
          tabBarIcon: (tabInfo) => {
            return (
              <Ionicons
                name="md-home"
                size={24}
                color={tabInfo.focused ? "#36454F" : "#8e8e93"}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Project"
        component={Project}
        options={{
          tabBarIcon: (tabInfo) => {
            return (
              <Ionicons
                name="document"
                size={24}
                color={tabInfo.focused ? "#36454F" : "#8e8e93"}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Contact"
        component={Contact}
        options={{
          tabBarIcon: (tabInfo) => {
            return (
              <Entypo
                name="old-phone"
                size={24}
                color={tabInfo.focused ? "#36454F" : "#8e8e93"}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function Main() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={TAB} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//<Button title="press" onPress={() => console.log(docu[0].uri)} />
