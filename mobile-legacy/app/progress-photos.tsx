import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function ProgressPhotosScreen() {
  const photos = useAppStore((state) => state.progressPhotos);
  const addPhoto = useAppStore((state) => state.addProgressPhoto);
  const updatePhoto = useAppStore((state) => state.updateProgressPhoto);
  const deletePhoto = useAppStore((state) => state.deleteProgressPhoto);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const pick = async (camera: boolean) => {
    setMessage('');
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setMessage(`Allow ${camera ? 'camera' : 'photo library'} access to add a progress photo.`); return; }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [3, 4] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [3, 4] });
    if (!result.canceled && result.assets[0]?.uri) addPhoto({ uri: result.assets[0].uri });
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>See progress beyond the scale.</Text><Text style={styles.subtitle}>Use consistent lighting, distance and pose. Photos stay private to your account.</Text>
    <View style={styles.actions}>{Platform.OS !== 'web' && <Pressable onPress={() => void pick(true)} style={styles.primary}><Ionicons name="camera" size={18} color={colors.accentDark} /><Text style={styles.primaryText}>Take photo</Text></Pressable>}<Pressable onPress={() => void pick(false)} style={styles.secondary}><Ionicons name="images-outline" size={18} color={colors.text} /><Text style={styles.secondaryText}>Choose photo</Text></Pressable></View>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {!photos.length ? <View style={styles.empty}><Ionicons name="image-outline" size={35} color={colors.textMuted} /><Text style={styles.emptyTitle}>No progress photos yet</Text><Text style={styles.emptyBody}>Add your first photo to begin a visual timeline.</Text></View> : <View style={styles.grid}>{photos.map((photo) => <View key={photo.id} style={styles.card}><Image source={{ uri: photo.uri }} style={styles.image} /><View style={styles.cardBody}><Text style={styles.date}>{new Date(photo.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</Text><TextInput value={photo.caption ?? ''} onChangeText={(caption) => updatePhoto(photo.id,{caption})} placeholder="Add a note…" placeholderTextColor="#68727A" style={styles.caption} />{confirmDelete === photo.id ? <View style={styles.confirm}><Pressable onPress={() => setConfirmDelete(null)}><Text style={styles.cancel}>Cancel</Text></Pressable><Pressable onPress={() => { deletePhoto(photo.id); setConfirmDelete(null); }}><Text style={styles.delete}>Delete</Text></Pressable></View> : <Pressable onPress={() => setConfirmDelete(photo.id)} style={styles.trash}><Ionicons name="trash-outline" size={16} color={colors.textMuted} /><Text style={styles.trashText}>Remove</Text></Pressable>}</View></View>)}</View>}
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},content:{padding:18,paddingBottom:50},title:{color:colors.text,fontSize:25,fontWeight:'900',lineHeight:31},subtitle:{color:colors.textMuted,fontSize:12,lineHeight:18,marginTop:8},actions:{flexDirection:'row',gap:10,marginTop:20},primary:{flex:1,height:49,borderRadius:14,backgroundColor:colors.accent,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},primaryText:{color:colors.accentDark,fontSize:12,fontWeight:'900'},secondary:{flex:1,height:49,borderRadius:14,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},secondaryText:{color:colors.text,fontSize:12,fontWeight:'800'},message:{color:colors.warning,fontSize:10,lineHeight:15,textAlign:'center',marginTop:12},empty:{alignItems:'center',justifyContent:'center',padding:30,minHeight:280,borderRadius:20,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,marginTop:25},emptyTitle:{color:colors.text,fontSize:15,fontWeight:'800',marginTop:12},emptyBody:{color:colors.textMuted,fontSize:11,textAlign:'center',marginTop:5},grid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:24},card:{width:'48%',borderRadius:18,overflow:'hidden',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border},image:{width:'100%',aspectRatio:0.75,backgroundColor:colors.surfaceRaised},cardBody:{padding:10},date:{color:colors.accent,fontSize:9,fontWeight:'900'},caption:{color:colors.text,fontSize:11,paddingVertical:7,borderBottomWidth:1,borderBottomColor:colors.border},trash:{flexDirection:'row',alignItems:'center',gap:5,marginTop:8},trashText:{color:colors.textMuted,fontSize:9,fontWeight:'700'},confirm:{flexDirection:'row',justifyContent:'space-between',marginTop:10},cancel:{color:colors.textMuted,fontSize:10,fontWeight:'800'},delete:{color:colors.danger,fontSize:10,fontWeight:'900'}});
