// Imports
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  Image,
  View,
  ScrollView,
  FlatList,
  Text,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  PermissionsAndroid,
  TouchableOpacity,
  ImageBackground,
  Linking,
  BackHandler,
  Animated,
  SafeAreaView,
  Dimensions
} from 'react-native';
import {withNavigation} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

// UI Imports
import {
  secondaryDark,
  grey2,
  grey3,
  grey4,
  primaryDark,
  primary1,
  white,
  black,
  grey5,
  grey6,
  primary,
  transparent,
  red,
  orangeYellow,
  yellowOrange,
} from '../../../ui/common/colors';
import {
  scalable,
  deviceWidth,
  deviceHeight,
  itemRadius,
  itemRadiusHalf,
  blockMarginHalf,
  blockMargin,
  blockPadding,
  blockPaddingHalf,
} from '../../../ui/common/responsive';
import ActionIcon from '../../../ui/icon/ActionIcon';
import {
  isDevelopment,
  imageUser,
  imageEvent,
} from '../../../setup/helpers/utils';
import Body from '../../common/Body';
import NavigationTopHome from '../../common/NavigationTopHome';
import {messageShow} from '../../common/api/actions';
import {tipperPages} from '../../../setup/routes/TipperStore/home';
import Typography from '../../../ui/Typography';
import ImageDefault from '../../../../assets/images/default-user.png';

//
import SocketManager from '../../../setup/socket/socketManager';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {
  LIVE_STATUS,
  videoConfig,
  audioConfig,
} from '../../../setup/socket/constants';
import {RTMP_SERVER} from '../../../setup/socket/config';
import {NodePlayerView} from 'react-native-nodemediaclient';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import ChatInputGroup from '../ChatInputGroup';
import MessagesList from '../MessagesList';
import FloatingHearts from '../FloatingHearts';
import get from 'lodash/get';
import {routesPages} from '../../../setup/routes/Store/pages';
import {eventPaymentWallet} from '../../../modules/events/api/actions/query';
import dateFormat from 'date-fns/format';
import Toast from 'react-native-simple-toast';
import { Button } from 'react-native';

const {width, height} = Dimensions.get('window');

// Component
class LiveStreamViewer extends PureComponent {
  constructor(props) {
    console.disableYellowBox = true;
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.Animation = new Animated.Value(0);
    this.state = {
      isHidden: false,

      user: '',
      user_id: '',
      event_id: '',
      busker_id: '',
      profile_image: '',
      token: '',
      streamUserName: '',
      userName: '',
      roomName: '',
      currentLiveStatus: LIVE_STATUS.PREPARE,
      messages: [],
      countHeart: 0,
      messageList: [],
      inputUrl: '',
      viewCount: 0,
      liveDuration: 0,
      sendMessage: '',
    };
  }

  componentDidMount = () => {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    this.permissionChk();
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.getUser();
      this.setState({count: 0});
    });
    this.getUser();
  };

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    // Remove the event listener before removing the screen from the stack
    this.focusListener.remove();
    clearTimeout(this.t);
  }

  handleBackButtonClick() {
    this.handleBackButton();
    //this.props.navigation.goBack(null);
    // return true;
  }

  onRefresh = () => {
    //this.getUser()
  };

  permissionChk = async () => {
    request(
      Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      }),
    )
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            break;
          case RESULTS.DENIED:
            break;
          case RESULTS.GRANTED:
            if (this.nodePlayerView) this.nodePlayerView.startPreview();
            break;
          case RESULTS.BLOCKED:
            break;
        }
      })
      .catch((error) => {
        // …
      });
  };

  socketListener = async () => {
    SocketManager.instance.emitJoinRoom({
      userName: this.state.userName,
      roomName: this.state.roomName,
    });
    SocketManager.instance.emitJoinCount({
      userName: this.state.userName,
      roomName: this.state.roomName,
    });
    SocketManager.instance.listenRoomMessages((data) => {
      const msg = get(data[0], 'messages', []);
      if (msg != '' && msg != '[]') {
        const messages = JSON.parse(msg);
        console.log('listenRoomMessages 11' + JSON.stringify(messages));
        this.setState({messages});
      }
    });
    SocketManager.instance.listenRoomDetails((data) => {
      console.log('listenRoomDetails ' + JSON.stringify(data));
    });
    SocketManager.instance.listenJoinCount((data) => {
      console.log('listenJoinCount ==> ' + JSON.stringify(data));
      this.setState({viewCount: data});

      var date1 = new Date();
      var unix_timestamp = 1602563280;
      var date = new Date(unix_timestamp * 1000);
      var hours = date.getHours();
      var minutes = '0' + date.getMinutes();
      var seconds = '0' + date.getSeconds();
      var formattedTime =
        hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      console.log(
        'formattedTime ==> ' +
          formattedTime +
          ' ' +
          date.getDate() +
          ' ' +
          date.getMonth() +
          ' ' +
          date.getFullYear(),
      );

      var cons =
        date.getFullYear() +
        '/' +
        (date.getMonth() + 1) +
        '/' +
        date.getDate() +
        ' ' +
        formattedTime;
      var date2 = new Date(cons);

      var res = Math.floor(Math.abs(date1 - date2) / 1000);

      this.setState({liveDuration: 0});
      console.log('seconds ' + res);

      setInterval(() => {
        this.setState({
          liveDuration: this.state.liveDuration + 1,
        });
      }, 1000);
    });
    SocketManager.instance.listenSendHeart(() => {
      this.setState((prevState) => ({countHeart: prevState.countHeart + 1}));
    });
    SocketManager.instance.listenSendMessage((data) => {
      const msg = get(data[0], 'messages', []);
      if (msg != '' && msg != '[]') {
        const messages = JSON.parse(msg);
        console.log('listenRoomMessages 11' + JSON.stringify(messages));
        this.setState({messages});
      }
    });
    SocketManager.instance.listenFinishLiveStream(() => {
      Alert.alert(
        'Alert ',
        'Thanks for watching this live stream',
        [
          {
            text: 'Okay',
            onPress: () => this.onPressClose(),
          },
        ],
        {cancelable: false},
      );
    });
    this.startBackgroundAnimation();
  };

  countdown = (sec) => {
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
  };

  startBackgroundAnimation = () => {
    this.Animation.setValue(0);
    Animated.timing(this.Animation, {
      toValue: 1,
      duration: 15000,
      useNativeDriver: false,
    }).start(() => {
      this.startBackgroundAnimation();
    });
  };

  setCameraRef = (ref) => {
    this.nodeCameraViewRef = ref;
  };

  onPressHeart = () => {
    SocketManager.instance.emitSendHeart({
      roomName: this.state.roomName,
    });
  };

  onPressSend = () => {
    SocketManager.instance.emitSendMessage({
      roomName: this.state.roomName,
      userName: this.state.userName,
      message: this.state.sendMessage,
      userImage: this.state.profile_image,
    });
    this.setState({sendMessage: ''});
  };

  onChangeMessageText = (text) => [this.setState({sendMessage: text})];

  onEndEditing = () => {
    //this.setState({isVisibleMessages: true});
  };

  onFocusChatGroup = () => {
    //this.setState({ isVisibleMessages: false });
  };

  onPressClose = () => {
    clearInterval();
    const {navigation} = this.props;
    navigation.navigate(routesPages.EventsHomeTipper.name);
  };

  componentWillUnmount() {
    if (this.nodePlayerView) this.nodePlayerView.stop();
    SocketManager.instance.emitLeaveRoom({
      userName: this.state.userName,
      roomName: this.state.roomName,
    });
    this.setState({
      messages: [],
      countHeart: 0,
    });
    clearTimeout(this.timeout);
  }

  getUser = async () => {
    AsyncStorage.setItem('pushNotify', '0');
    const {is_follow_status} = this.state;
    const token = await AsyncStorage.getItem('token');
    const liveStreamBuskerId = await AsyncStorage.getItem('LiveStreamBuskerId');
    const liveStreamId = await AsyncStorage.getItem('LiveStreamId');
    const liveStreamName = await AsyncStorage.getItem('LiveStreamName');
    const liveStreamImage = await AsyncStorage.getItem('LiveStreamImage');
    this.setState({
      inputUrl: `${RTMP_SERVER}/live/${liveStreamName + liveStreamId}`,
    });
    //alert(this.state.inputUrl);
    this.setState({roomName: liveStreamName + liveStreamId});
    this.setState({liveStreamImage: liveStreamImage});
    this.setState({event_id: liveStreamId});
    this.setState({busker_id: liveStreamBuskerId});
    let user = JSON.parse(await AsyncStorage.getItem('user'));
    this.setState({
      streamUserName: liveStreamName,
    });

    if (user !== '') {
      this.setState({
        user,
        token: token,
        profile_image: user.profile_image,
        user_id: user.id,
        userName: user.Name + user.id,
      });
      this.socketListener();
    }
  };

  BuskerrProfile1 = () => {
    const {navigation} = this.props;
    navigation.navigate(tipperPages.tipperProfile.name);
  };

  handleBackButton = () => {
    Alert.alert(
      'Quit Live',
      'Are you sure want to quit Live?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const {navigation} = this.props;
            navigation.navigate(routesPages.EventsHomeTipper.name);
          },
        },
      ],
      {
        cancelable: false,
      },
    );
    return true;
  };

  makePayment = async ({amount}) => {
    const {eventPaymentWallet, messageShow} = this.props;
    const {user_id, token, event_id, busker_id} = this.state;

    var dateTime = new Date();
    let date = dateFormat(dateTime, 'dd MMM yyyy');
    let time = dateFormat(dateTime, 'hh:mm:ss a');
    let Txid = 'Tx' + Math.random().toString(36).substring(2);
    console.log('random', Txid);
    const formPayment = new FormData();

    formPayment.append('user_id', user_id);
    formPayment.append('amount', amount);
    formPayment.append('buskerid', busker_id);
    formPayment.append('eventId', event_id);
    formPayment.append('status', 1);
    formPayment.append('paymenttype', 1);

    formPayment.append('transactionid', Txid);
    formPayment.append('date', date);
    formPayment.append('time', time);

    console.log('Payment Form Data' + JSON.stringify(formPayment));

    try {
      const {data} = await eventPaymentWallet(formPayment, token);

      if (data.status === 200) {
        messageShow({success: true, message: 'Payment done successfully'});
      } else {
        if (
          data.message != '' &&
          data.message != null &&
          data.message != 'null'
        ) {
          Toast.show(data.message);
        } else {
          Toast.show(translate.t('common.error.default'));
        }
      }
    } catch (error) {
      Toast.show(translate.t('common.error.default'));
    }
  };

  renderBackgroundColors = () => {
    const backgroundColor = this.Animation.interpolate({
      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
      outputRange: [
        '#1abc9c',
        '#3498db',
        '#9b59b6',
        '#34495e',
        '#f1c40f',
        '#1abc9c',
      ],
    });
    if (this.liveStatus === LIVE_STATUS.FINISH) return null;
    return (
      <Animated.View style={[styles.backgroundContainer, {backgroundColor}]}>
        <SafeAreaView style={styles.wrapperCenterTitle}>
          <Text style={styles.titleText}>
            Stay here and wait until live stream start
          </Text>
        </SafeAreaView>
      </Animated.View>
    );
  };

  renderNodePlayerView = () => {
    const {inputUrl} = this.state;
    if (!inputUrl) return null;
    return (
      <NodePlayerView
        style={styles.playerView}
        ref={(vb) => {
          this.nodePlayerView = vb;
        }}
        inputUrl={inputUrl}
        bufferTime={300}
        maxBufferTime={1000}
        autoplay
      />
    );
  };

  renderChatGroup = () => {
    return (
      <ChatInputGroup
        onPressHeart={this.onPressHeart}
        onPressSend={this.onPressSend}
        onFocus={this.onFocusChatGroup}
        onEndEditing={this.onEndEditing}
      />
    );
  };

  renderListMessages = () => {
    const {messages} = this.state;

    return (
     
          <MessagesList messages={messages} state={1} />
       
    );
  };

  render() {
    const {
      profile_image,
      userName,
      inputUrl,
      liveStreamImage,
      countHeart,
      streamUserName,
      viewCount,
      liveDuration,
      sendMessage,
    } = this.state;
    //if (!inputUrl) return null;
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: '#3498db'}}>
          <NodePlayerView
            style={styles.playerView}
            ref={(vb) => {
              this.nodePlayerView = vb;
            }}
            inputUrl={inputUrl}
            bufferTime={300}
            maxBufferTime={1000}
            autoplay
          />
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                height: 55,
                alignItems: 'center',
                marginTop: 10,
              }}>
              <TouchableOpacity style={{width: '25%'}}>
                <Image
                  source={
                    profile_image === '' || profile_image === null
                      ? ImageDefault
                      : {uri: imageUser(liveStreamImage), cache: 'force-cache'}
                  }
                  resizeMode={'cover'}
                  defaultSource={ImageDefault}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    marginLeft: blockMargin,
                  }}
                />
              </TouchableOpacity>
              <View
                style={{
                  width: '42%',
                  flexDirection: 'column',
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                <Typography
                  color={'#FFFFFF'}
                  family={'Montserrat-Bold'}
                  size={scalable(14)}>
                  {streamUserName}
                </Typography>
                <Typography
                  color={'#FFFFFF'}
                  family={'Montserrat-Regular'}
                  size={scalable(14)}
                  style={{
                    marginTop: 5,
                  }}>
                  {this.countdown(liveDuration)}
                </Typography>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  width: '30%',
                  marginEnd: '3%',
                }}>
                <LinearGradient
                  colors={[orangeYellow, yellowOrange]}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 0.8}}
                  style={{
                    flexDirection: 'row',
                    height: 30,
                    width: 60,
                    borderRadius: itemRadius * 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../../../../assets/Icons/view_icon.png')}
                    resizeMode={'cover'}
                    style={{
                      width: 18,
                      height: 12,
                      resizeMode: 'cover',
                      marginEnd: 5,
                    }}
                  />
                  <Typography
                    color={white}
                    family={'Montserrat-Bold'}
                    size={scalable(10)}>
                    {viewCount}
                  </Typography>
                </LinearGradient>
                <TouchableOpacity onPress={() => this.handleBackButton()}>
                  <Image
                    source={require('../../../../assets/Icons/close_livechat_icon.png')}
                    resizeMode={'cover'}
                    style={{
                      width: 28,
                      height: 28,
                      marginLeft: blockMargin,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                marginBottom: 10,
                position: 'absolute',
                bottom: 0,
              }}>
              <View
                style={{width:'100%',
                }}>
                   <View style={{flexDirection: 'row'}}>
        <View style={{width: '80%'}}>
         {this.renderListMessages()}
        </View>
        <View
          style={{
            width: '18%',
            right: 0,
            zIndex: 2,
          }}>
          <TouchableOpacity onPress={() => this.makePayment(5)}>
            <LinearGradient
              colors={[orangeYellow, yellowOrange]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 0.8}}
              style={{
                flexDirection: 'row',
                height: 50,
                width: 50,
                borderRadius: itemRadius * 5,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text style={{color: 'white'}}>$5</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.makePayment(10)}>
            <LinearGradient
              colors={[orangeYellow, yellowOrange]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 0.8}}
              style={{
                flexDirection: 'row',
                height: 50,
                width: 50,
                borderRadius: itemRadius * 5,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text style={{color: 'white'}}>$10</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.makePayment(15)}>
            <LinearGradient
              colors={[orangeYellow, yellowOrange]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 0.8}}
              style={{
                flexDirection: 'row',
                height: 50,
                width: 50,
                borderRadius: itemRadius * 5,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text style={{color: 'white'}}>$15</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.makePayment(20)}>
            <LinearGradient
              colors={[orangeYellow, yellowOrange]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 0.8}}
              style={{
                flexDirection: 'row',
                height: 50,
                width: 50,
                borderRadius: itemRadius * 5,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text style={{color: 'white'}}>$20</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  width: '95%',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <TextInput
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 25,
                    paddingHorizontal: 15,
                    height: 45,
                    width: '70%',
                  }}
                  placeholder="Comment input"
                  underlineColorAndroid="transparent"
                  onChangeText={this.onChangeMessageText}
                  value={sendMessage}
                  autoCapitalize="none"
                  autoCorrect={false}
                  //onEndEditing={this.onEndEditing}
                  //onFocus={this.onFocus}
                />
                <View
                  style={{
                    width: '30%',
                    flexDirection: 'row',
                  }}>
                  <TouchableOpacity
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 45,
                      backgroundColor: '#3283F1',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 8,
                    }}
                    onPress={() => this.onPressSend()}
                    activeOpacity={0.6}>
                    <Image
                      source={require('../../../../assets/Icons/send_msg.png')}
                      style={{width: 33, height: 33}}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 45,
                      backgroundColor: 'white',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 8,
                      zIndex: 2,
                    }}
                    onPress={this.onPressHeart}
                    activeOpacity={0.6}>
                    <Image
                      source={require('../../../../assets/Icons/ico_heart.png')}
                      style={{width: 45, height: 45, zIndex: 2}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <FloatingHearts count={countHeart} />
          </View>
        </View>
      </SafeAreaView >
    );
  }
}

// Component Properties
LiveStreamViewer.propTypes = {
  messageShow: PropTypes.func.isRequired,
  eventPaymentWallet: PropTypes.func.isRequired,
};

// Component State
function LiveStreamViewerState(state) {
  return {
    // services: state.services,
    // settings: state.settings
  };
}

export default connect(LiveStreamViewerState, {
  messageShow,
  eventPaymentWallet,
})(withNavigation(LiveStreamViewer));
