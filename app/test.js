import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { FIREBASE_STORAGE, FIRE_STORE } from "../firebaseConfig";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";

export default function Test() {
  const [fileName, setFileName] = useState();
  const [blodFile, setBlodFile] = useState();
  const [todos, setTodos] = useState([]);
  const [load, setLoad] = useState(false);
  const [link, setLink] = useState();
  const [num, setNum] = useState();
  const [testing, setTesting] = useState();

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync();
    if (result != null) {
      const f = result.assets;
      const r = await fetch(f[0].uri);
      const b = await r.blob();
      setFileName(f[0].name);
      setBlodFile(b);
      console.log(fileName);
      //setIsChoosed(true)
    }
  };

  const UploadFile = (blobFile, isUploadCompleted) => {
    if (!blobFile) return;
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
          return downloadURL;
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

  const downloadFile = async (fName, uri) => {
    const result = await FileSystem.downloadAsync(
      uri,
      FileSystem.documentDirectory + fName
    );

    save(result.url, fName, result.headers["content-type"]);
    console.log(result.uri);
    setLink(result.uri);
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

  const readingFile = async (uri) => {
    try {
      const cUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: cUri,
        flags: 1,
        type: "application/pdf",
      });
      console.log(reading);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text></Text>
      <Button title="get file" onPress={pickDocument} />
      <Button title="upload file" onPress={UploadFile} />
      <FlatList
        data={todos}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={{
                width: 300,
                height: 150,
                backgroundColor: "red",
                borderRadius: 10,
              }}
              onPress={() => readingFile(item.uri)}
            >
              <Text>{item.name}</Text>
              <Text>{item.uri}</Text>
              <TouchableOpacity
                style={{ backgroundColor: "white" }}
                onPress={() => downloadFile(item.name, item.uri)}
              >
                <Text>TEST</Text>
              </TouchableOpacity>
              <Text>{num}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
