import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native'

const removeAd  = `
  setTimeout(() => document.body.style.display = 'none' , 5000);
  setTimeout(() => alert('999999999999999') , 5000);
  true;
  `

export default ({ navigation: { goBack } }) => {
  const route = useRoute();
  const uri = decodeURIComponent(route.params.id);
  let webRef = React.createRef();
  const run = `
      let style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '.Daily { display: none!important; } .view-more { display: none!important; }';
      document.getElementsByTagName('head')[0].appendChild(style);
      true;
    `;

    setTimeout(() => {
      webRef.current.injectJavaScript(run);
    }, 200);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ uri }}
        ref={webRef}
        injectedJavaScript={run}
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