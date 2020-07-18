import React, { useEffect, useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useProxy } from '../utils';

const {width:windowWidth, height:windowHeight} = Dimensions.get('window')

export default ({ navigation: { goBack } }) => {
  const route = useRoute();
  const uri = decodeURIComponent(route.params.id);
  const iframeRef = React.createRef();

  const [srcDoc, setSrcDoc] = useState('');
  const [init , setInit] = useState(false);

  const cleanDoc = (str) => {
    const cssStr = '.Daily { display: none!important; } .view-more { display: none!important; }';
    const regexCss = /(?<=<style>)([\s\S]+)(?=<\/style>)/
    const regex = /<script src=.+zhihu\.com.+><\/script>/g;
    return str.replace(regex, '').replace(regexCss, (match, p) => match + cssStr)
      .replace(/(?<=\/\/)pic3(?=\.)/g, 'pic2');
  }
  
  useEffect(() => {
    if (init) return;
    setInit(true);
    fetch(useProxy(uri)).then(res => res.text()).then(
      doc => setSrcDoc(cleanDoc(doc))
    )
  });

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <iframe ref={iframeRef}
        style={{height: windowHeight - 5}}
        srcdoc={ srcDoc }
      />
      <View style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 40,
        opacity: 0.9,
        backgroundColor: '#cccccc',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
      <TouchableWithoutFeedback onPress={goBack}>
        <Text style={{
          fontSize: 40, 
          fontWeight:'100', 
          paddingLeft: 12, 
          lineHeight: 40,
          height: '100%', 
          width: 40
          }}
        >
          {`<`}
        </Text>
      </TouchableWithoutFeedback>
      
      <View style={{
            height: '70%',
            borderRightWidth: 0.5,
            borderRightColor: '#666666',
            opacity: 1,	
            marginHorizontal: 0,
          }}
        />
        
      </View>
    </View>
    
    
    
  )
}