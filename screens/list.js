import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Carousel, { ParallaxImage, Pagination } from 'react-native-snap-carousel';
import { LinearGradient } from 'expo-linear-gradient';

import { isNative, useProxy, yesterday, getRGBA, getCapitalNum } from '../utils';
import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { getAutomaticTypeDirectiveNames } from 'typescript';

const listByDateApi = 'https://news-at.zhihu.com/api/4/stories/before/'; 
const initStoriesApi = 'https://news-at.zhihu.com/api/4/stories/latest';

const {width:windowWidth, height:windowHeight} = Dimensions.get('window')
const listRef = React.createRef();
let cache = {
  init: false,
  scrollOffset: 0
}

export default function TabOneScreen({navigation: { navigate } }) {
  const [state, setState] = useState({
    loading: false,
    date: new Date().yyyymmdd(),
    activeSlideIndex: 0,
    banners: [],
    stories: []
  });

  // componentDidMount, 初始化列表、banner数据
  useEffect(() => {
    // banner获取当天数据
    if (cache.init) return;
    cache.init = true;
    getRefreshData();
  });

  // 跳转详情页
  const goToDetail = (id = 1) => {
    navigate('Detail', {id});
  }

  // 请求刷新数据
  const getRefreshData = () => {
    const today = 
    new Date().yyyymmdd();
    setState(state => ({
      ...state,
      loading: true,
    }))

    let targetUrl = isNative() ? initStoriesApi : useProxy(initStoriesApi);
    // 获取stories
    fetch(targetUrl).then(res => {return res.json()}).then(data => {
      setState(state => ({
        ...state,
        loading: false,
        banners: data.top_stories,
        stories: data.stories,
      }))  
    }).catch(e => {
      setState(state => ({
        ...state,
        loading: false,
      }))  
      console.log(e);
    })
  }

  // 上拉加载
  const onEndReached = () => {
    setState(state => ({
      ...state,
      loading: true,
    }))  
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

      setState(state => ({
        ...state,
        date,
        stories: state.stories.concat(stories)
      }));

      window.setTimeout(() => {
        setState(state => ({
          ...state,
          loading: false,
        }))
      }, 500)
    }).catch(e => {
      setState(state => ({
        ...state,
        loading: false,
      }));
    })
  }

  // stories列表
  const renderItem = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => goToDetail(item.url)}>
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
    </TouchableWithoutFeedback>
    
  );

  const renderBanner = ({item: data, index}, parallaxProps) => {
    return (
      <TouchableWithoutFeedback onPress={() => goToDetail(data.url)}>
        <View key={data['id'].toString()} style={styles.slide}>
          {/* <Image style={{width: '100%', height: '100%'}} source={{uri: data.image.replace('pic3', 'pic2')}}/> */}
          <ParallaxImage
              source={{ uri: data.image.replace('pic3', 'pic2') }}
              containerStyle={{width: windowWidth, height: '100%', flex: 1,}}
              style={ styles.bannerImage }
              parallaxFactor={0.1}
              {...parallaxProps}
          />
  
          <LinearGradient 
            colors={[getRGBA(data.image_hue, 0),getRGBA(data.image_hue, 0.2),getRGBA(data.image_hue, 0.5), getRGBA(data.image_hue, 0.9),getRGBA(data.image_hue, 1)]}
            style={{
              position: 'absolute',
              bottom: 0,
              height: 110,
              width: '100%',
            }}
          >
            <Text 
              style={{
                paddingHorizontal:12,
                fontSize: 23,
                fontWeight: '700',
                color: '#FFFFFF',
              }}>
              { data.title }
            </Text>
            <Text 
              style={{
                paddingHorizontal:12,
                fontSize: 16,
                marginTop: 6,
                color: '#FFFFFF',
                opacity: 0.6,
              }}>
              { data.hint }
            </Text>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  const renderPagination = () => {
    return (
      <Pagination
        dotsLength={state.banners.length}
        activeDotIndex={state.activeSlideIndex}
        containerStyle={{ 
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 80 
        }}
        dotContainerStyle = {{
          marginHorizontal: 2,
        }}
        dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.92)'
        }}
        inactiveDotStyle={{
            // Define styles for inactive dots here
        }}
        inactiveDotOpacity={0.6}
        inactiveDotScale={0.5}
      />
    )
  }

  const swiper = (
    <View style={{flex: 1, height: 370}}>
       <Carousel
          autoplay={true}
          autoplayInterval={5000}
          apparitionDelay={1000}
          lockScrollWhileSnapping={true}
          data={state.banners}
          sliderWidth={windowWidth}
          itemWidth={windowWidth}
          renderItem={renderBanner}
          hasParallaxImages={true}
          onSnapToItem = { index => setState({ ...state, activeSlideIndex:index }) } 
        />
        { renderPagination() }
      <View style={{width: '100%', height: 20}}></View>
    </View>
    
  )

  return (
    <View style={styles.container}>
      <View style={{
          height: 65, 
          paddingHorizontal: 12, 
          paddingVertical:10,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 20
        }}
      >
        <View style={{width:40, flexDirection:'column'}}>
          <Text style={{
              fontSize:18,
              fontWeight: 'bold',
              textAlign: 'center',
              textAlignVertical: 'center',
              flex: 1,
            }}
            
          >
            {new Date().getDate()}
          </Text>
          <Text style={{
              fontSize:13,
              fontWeight: '500',
              textAlign: 'center',
              textAlignVertical: 'center',
              flex: 1,
            }}
          >
          {`${getCapitalNum(new Date().getMonth() + 1)}月`}
          </Text>
        </View>
        
        <View style={{
            width: 0,
            height: 30,
            borderRightWidth: 0.5,
            borderRightColor: '#cccccc',
            opacity: 1,	
            marginHorizontal: 12,
          }}
        />
        <Text style={{
            flex: 1,
            fontSize:24,
            fontWeight: 'bold',
            paddingVertical: 10
          }}
        >
          知乎日报
        </Text>
      </View>
      <FlatList style= { styles.list }
        keyExtractor= {(item, index) => `${item.ga_prefix}${index}`} 
        onEndReachedThreshold="0.3"
        onEndReached={onEndReached}
        onRefresh={getRefreshData}
        refreshing={state.loading}
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
    height: windowHeight,
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
    // flex: 1,
    width: windowWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: windowWidth,
    resizeMode: 'cover',
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
