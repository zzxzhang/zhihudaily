import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, Image } from 'react-native';
import { ListItem } from 'react-native-material-ui';
import Swiper from 'react-native-swiper';
import { LinearGradient } from 'expo-linear-gradient';

import { isNative, useProxy, yesterday, getRGBA } from '../utils';
import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { getAutomaticTypeDirectiveNames } from 'typescript';

const listByDateApi = 'https://news-at.zhihu.com/api/4/stories/before/'; 
const initStoriesApi = 'https://news-at.zhihu.com/api/4/stories/latest';

export default function TabOneScreen() {
  const [state, setState] = useState({
    init: false,
    date: new Date().yyyymmdd(),
    banners: [],
    stories: []
  });

  useEffect(() => {
    // banner获取当天数据
    if (state.init) return;
    const today = 
    new Date().yyyymmdd();
    setState(state => ({
      ...state,
      init: true,
    }))

    let targetUrl = isNative() ? initStoriesApi : useProxy(initStoriesApi);
    // 获取stories
    fetch(targetUrl).then(res => {return res.json()}).then(data => {

      setState(state => ({
        ...state,
        init: true,
        banners: data.top_stories,
        stories: data.stories,
      }))  
    }).catch(e => {
      console.log(e);
    })
  });

  // 上拉加载
  const onEndReached = () => {
    let fetchPromises = [];
    const lastDate = parseInt(state.date);

    let targetUrl = isNative() ? listByDateApi : useProxy(listByDateApi);
    for (let date = lastDate - 1; date >= lastDate - 3; date = yesterday(date)) {
      fetchPromises.push(
        fetch(`${targetUrl}${date}`).then(res => {return res.json()}))
    }

    Promise.all(fetchPromises).then(datas => {
      let stories = [];
      let date;
      datas.map((data, index) => {
        stories = stories.concat(data.stories);
        if (index === datas.length - 1) {
          date = data.date;
        }
      })

      setState({
        ...state,
        date,
        stories: state.stories.concat(stories)
      });
    })
  }

  const renderSwiper = () => {
    return state.banners.map(data => (
      <View>
        <Image source={data.image.replace('pic3', 'pic2')}/>
      </View>)
    )
  }

  const renderItem = ({ item }) => (
    <View style= {styles.listitem}>
      <View style={styles.textContainer}>
        <Text style={styles.storieTitle}>{ item.title }</Text>
        <Text style={styles.storieHint}>{ item.hint }</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image style={styles.storieImage}
          source={{
            uri: (item.images && item.images.length > 0) ? item.images[0].replace('pic3', 'pic2') : ''
          }}/>
      </View>
    </View>
    
  );

  const swiper = (
    <View style={{flex: 1}}>
      <Swiper 
        showsButtons={true} 
        style={{ height: 300}}
        paginationStyle={{justifyContent:'flex-end',right:20}}  
      >
        {
          state.banners.map(data => (
            <View key={data['id'].toString()} style={styles.slide}>
              <Image style={{width: '100%', height: '100%'}} source={{uri: data.image.replace('pic3', 'pic2')}}/>
              <LinearGradient 
                colors={[getRGBA(data.image_hue, 0.1),getRGBA(data.image_hue, 0.8), getRGBA(data.image_hue, 0.9),getRGBA(data.image_hue, 1)]}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  height: 60,
                  display: 'flex',
                  padding: 12,
                  width: '100%'
                }}
              >
                <Text 
                  style={{
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: '400',
                    flex: 1,
                    color: '#FFFFFF',
                  }}>
                  { data.title }
                </Text>
                <Text 
                  style={{
                    justifyContent: 'center',
                    
                    fontSize: 12,
                    flex: 1,
                    color: '#fffafa',
                  }}>
                  { data.hint }
                </Text>
              </LinearGradient>
            </View>
            )
          )
        }
      </Swiper>
      <View style={{width: '100%', height: 20}}></View>
    </View>
    
  )

  return (
    <View style={styles.container}>
      <FlatList style= { styles.list }
        keyExtractor= {(item, index) => `${item.ga_prefix}${index}`} 
        onEndReachedThreshold="0.5"
        onEndReached={onEndReached}
        data={ state.stories }
        renderItem={renderItem}
        ListHeaderComponent={swiper}
      >
      </FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },
  listitem: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 12,
    height: 120,
  },
  textContainer: {
    display: 'flex',
    flex: 1,
  },
  storieTitle: {
    // flex: 1,
    fontWeight: 'bold',
  },
  storieHint: {
    fontSize: 12,
    marginTop: 6,
    color: '#666666'
  },
  imageContainer: {
    display: 'flex',
    marginLeft: 12,
  },
  storieImage: {
    width: 80,
    height: 80,
  }
});
