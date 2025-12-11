// mobile/App.js
import React, { useEffect, useState } from "react";
import { View, FlatList, TextInput, Button, Text, Alert } from "react-native";

const BACKEND_URL = "http://192.168.0.100:3000"; // <- altere para o IP da sua máquina (ou localhost com emulador)

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch(`${BACKEND_URL}/items`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      Alert.alert("Erro", String(e));
    }
  }

  async function addItem() {
    if (!name) return Alert.alert("Erro", "Digite um nome");
    const body = { name, description: desc };
    const res = await fetch(`${BACKEND_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setName("");
    setDesc("");
    fetchItems();
  }

  async function startEdit(item) {
    setEditingId(item.id);
    setName(item.name);
    setDesc(item.description);
  }

  async function saveEdit() {
    if (!editingId) return;
    await fetch(`${BACKEND_URL}/items/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc }),
    });
    setEditingId(null);
    setName("");
    setDesc("");
    fetchItems();
  }

  async function deleteItem(id) {
    await fetch(`${BACKEND_URL}/items/${id}`, { method: "DELETE" });
    fetchItems();
  }

  return (
    <View style={{ padding: 20, paddingTop: 60 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>CRUD Simples</Text>
      <TextInput
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
      />
      <TextInput
        placeholder="Descrição"
        value={desc}
        onChangeText={setDesc}
        style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
      />
      {editingId ? (
        <Button title="Salvar edição" onPress={saveEdit} />
      ) : (
        <Button title="Adicionar" onPress={addItem} />
      )}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            <Text>{item.description}</Text>
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              <Button title="Editar" onPress={() => startEdit(item)} />
              <View style={{ width: 10 }} />
              <Button title="Excluir" onPress={() => deleteItem(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}
