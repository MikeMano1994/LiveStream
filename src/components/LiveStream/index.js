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
  SafeAreaView,
  Dimensions,
} from 'react-native';
const {width, height} = Dimensions.get('window');
import styles from './styles';
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
  Grey,
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
import { BottomSheet } from 'react-native-btr';
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
import {NodeCameraView} from 'react-native-nodemediaclient';
import LinearGradient from 'react-native-linear-gradient';
import ChatInputGroup from '../ChatInputGroup';
import MessagesList from '../MessagesList';
import FloatingHearts from '../FloatingHearts';
import LiveStreamActionButton from './LiveStreamActionButton';
import get from 'lodash/get';
import axios from 'axios';

// Component
class LiveStream extends PureComponent {
  constructor(props) {
    console.disableYellowBox = true;
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      isHidden: false,
      isQuit:false,

      user: '',
      user_id: '',
      profile_image: '',
      token: '',
      streamUserName: '',
      userName: '',
      roomName: '',
      currentLiveStatus: LIVE_STATUS.PREPARE,
      messages: [
      ],
      countHeart: 0,
      messageContent: '',
      viewCount: 0,
      liveDuration: 0,
      sendMessage: '',
      event_id:''
    };
  }

  componentDidMount = () => {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.backPress,
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
      this.backPress,
    );
    // Remove the event listener before removing the screen from the stack
    this.focusListener.remove();
    clearTimeout(this.t);
  }

  handleBackButtonClick() {
    this.handleBackButton();
    // this.props.navigation.goBack(null);
    // return true;
  }

  backPress = () => true;

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
            if (this.nodeCameraViewRef) this.nodeCameraViewRef.startPreview();
            break;
          case RESULTS.BLOCKED:
            break;
        }
      })
      .catch((error) => {
        // …
      });
  };

  getUser = async () => {
    AsyncStorage.setItem('pushNotify', '0');
    const {is_follow_status} = this.state;
    const token = await AsyncStorage.getItem('token');
    const event_id = await AsyncStorage.getItem('LiveEventId');
    let user = JSON.parse(await AsyncStorage.getItem('user'));

    if (user !== '') {
      this.setState({
        user,
        token: token,
        profile_image: user.profile_image,
        user_id: user.id,
        streamUserName: user.Name,
        userName: user.Name + user.id,
        roomName: user.Name + user.id,
        event_id: event_id
      });
      this.socketListener();
    }
  };

  socketListener = async () => {
    //alert('user ==> ' + this.state.userName);

    SocketManager.instance.emitPrepareLiveStream({
      userName: this.state.userName,
      roomName: this.state.roomName,
      beginLiveAt: new Date().getTime(),
    });
    SocketManager.instance.emitJoinRoom({
      userName: this.state.userName,
      roomName: this.state.roomName,
    });
    SocketManager.instance.listenJoinCount((data) => {
      this.setState({viewCount: data});
      console.log('listenJoinCount ==> ' + JSON.stringify(data));
    });
    SocketManager.instance.listenRoomMessages((data) => {
      const msg = get(data[0], 'messages', []);
      if (msg != '' && msg != '[]') {
        const messages = JSON.parse(msg);
        console.log('listenRoomMessages 11' + JSON.stringify(messages));
        this.setState({messages});
      }
    });
    setInterval(() => {
      this.setState({
        liveDuration: this.state.liveDuration + 1,  
      });
    }, 1000);
    SocketManager.instance.listenBeginLiveStream((data) => {
      const currentLiveStatus = get(data[0], 'liveStatus', '');
      alert('currentLiveStatus '+currentLiveStatus)
      this.setState({currentLiveStatus});
    });
    SocketManager.instance.listenFinishLiveStream((data) => {
      //console.log('listenFinishLiveStream ==> ' + JSON.stringify(data));
      //const currentLiveStatus = get(data[0], 'liveStatus', '');
      const currentLiveStatus = 2;
      this.setState({currentLiveStatus});
    });
    SocketManager.instance.listenSendHeart(() => {
      this.setState((prevState) => ({countHeart: prevState.countHeart + 1}));
    });
    SocketManager.instance.listenSendMessage((data) => {
      const msg = get(data[0], 'messages', []);

      if (msg != '' && msg != '[]') {
        const messages = JSON.parse(msg);
        console.log('listenSendMessage 11' + JSON.stringify(messages));
        this.setState({messages});
      }
    });

    this.onPressLiveStreamButton();
    this.goForLive();

    //console.log('convertHMS ' + this.convertHMS(this.state.liveDuration + 1));
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

  goForLive = () => {
    const {user_id, token,event_id} = this.state;
    console.log('user_id ==> ' + user_id);
    //console.log('last_name ==> '+JSON.stringify(filePath.data));
    axios
      .post(
        'http://buskerrapp.dci.in/api/liveNotifications',
        {
          user_id: user_id,
          event_id:event_id
        },
        {
          headers: {
            'Content-Type': 'application/json',

            
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then((response) => {
        console.log(
          'goForLive',
          'response get details:' + JSON.stringify(response.data),
        );
      })
      .catch((error) => {
        console.log('goForLive reactNativeDemo axios error:', error);
      });
  };

  onPressLiveStreamButton = () => {
    const {navigation} = this.props;
    const {currentLiveStatus, roomName, userName} = this.state;
alert(currentLiveStatus)
    if (Number(currentLiveStatus) === Number(LIVE_STATUS.PREPARE)) {
      SocketManager.instance.emitBeginLiveStream({
        userName: userName,
        roomName: roomName,
        beginLiveAt: new Date().getTime(),
      });
      SocketManager.instance.emitJoinRoom({
        userName: userName,
        roomName: roomName,
      });
      if (this.nodeCameraViewRef) {
        setTimeout(() => {
          this.nodeCameraViewRef.startPreview();
          this.nodeCameraViewRef.start();
        }, 2000);
      }
    } else if (Number(currentLiveStatus) === Number(LIVE_STATUS.ON_LIVE)) {
      //alert(userName);
      SocketManager.instance.emitFinishLiveStream({
        userName,
        roomName: roomName,
      });
      if (this.nodeCameraViewRef) this.nodeCameraViewRef.stop();
      Alert.alert(
        'Alert ',
        'Thanks for your live stream',
        [
          {
            text: 'Okay',
            onPress: () => {
              clearInterval();
              SocketManager.instance.emitLeaveRoom({
                userName,
                roomName: userName,
              });
              navigation.navigate(tipperPages.tipperProfile.name);
            },
          },
        ],
        {cancelable: true},
      );
    }
  };

  setCameraRef = (ref) => {
    this.nodeCameraViewRef = ref;
  };

  componentWillUnmount() {
    if (this.nodeCameraViewRef) this.nodeCameraViewRef.stop();
    SocketManager.instance.emitLeaveRoom({
      userName: this.state.userName,
      roomName: this.state.roomName,
    });
  }

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
            this.onPressLiveStreamButton();
          },
        },
      ],
      {
        cancelable: false,
      },
    );
    return true;
  };

  onPressHeart = () => {
    //alert(this.state.roomName);
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

  onEndEditing = () => {
    //this.setState({isVisibleMessages: true});
  };

  onFocusChatGroup = () => {
    //this.setState({isVisibleMessages: false});
  };

  switchCamera = () => {
    this.nodeCameraViewRef.switchCamera();
  };

  onPressClose = () => {
    const {navigation} = this.props;
    navigation.navigate(tipperPages.tipperProfile.name);
  };

  quitCancel = () => {
    // alert(JSON.stringify(this.state.coCreatorData))
    this.setState({isQuit: !this.state.isQuit});
   
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
    return <MessagesList messages={messages} state={0} />;
  };

  onChangeMessageText = (text) => [this.setState({sendMessage: text})];

  render() {
    const {
      profile_image,
      streamUserName,
      roomName,
      countHeart,
      messages,
      currentLiveStatus,
      viewCount,
      liveDuration,
      sendMessage,
    } = this.state;
    const outputUrl = `${RTMP_SERVER}/live/${this.state.roomName}`;

    return (
      <SafeAreaView style={styles.container}>
        <NodeCameraView
          style={styles.streamerView}
          ref={this.setCameraRef}
          outputUrl={outputUrl}
          camera={{cameraId: 1, cameraFrontMirror: false}}
          audio={audioConfig}
          video={videoConfig}
          smoothSkinLevel={3}
          autopreview={false}
        />
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              height: 55,
              alignItems: 'center',
              marginTop: 20,
            }}>
            <TouchableOpacity style={{width: '25%'}}>
              <Image
                source={
                  profile_image === ''
                    ? ImageDefault
                    : {uri: imageUser(profile_image), cache: 'force-cache'}
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
              <TouchableOpacity onPress={() => this.setState({isQuit: true})}>
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
          <TouchableOpacity onPress={() => this.switchCamera()}>
            <Image
              source={require('../../../../assets/Icons/rotate_camera.png')}
              resizeMode={'cover'}
              style={{
                width: 35,
                height: 35,
                marginTop: 10,
                marginEnd: 10,
                justifyContent: 'flex-end',
                alignContent: 'flex-end',
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                marginLeft: blockMargin,
              }}
            />
          </TouchableOpacity>

          <View
            style={{
              marginBottom: 10,
              position: 'absolute',
              bottom: 0,
            }}>
            <View
              style={{
                height: height / 2.2,
              }}>
              {this.renderListMessages()}
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

          
<BottomSheet
visible={this.state.isQuit}
onBackButtonPress={this.quitCancel}
onBackdropPress={this.quitCancel}>

<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>

 <View style={{
   // height: deviceHeight / 100 * 50, width: deviceWidth / 100 * 92,
   flexDirection: 'column',
   // borderColor: '#b59739', borderWidth: 3,
   borderRadius: itemRadius, backgroundColor: 'white',
   margin: blockMargin, justifyContent: 'center',
 }}>


   <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: blockMargin * 1.2 }}>
     <Typography color={black} family={'Montserrat-Medium'} size={scalable(18)}>Quit Live</Typography>
   </View>

   <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: blockMargin }}>
     <Typography color={Grey} family={'Montserrat-Medium'} size={scalable(16)}>{'Are you sure want to quit Live?'}</Typography>

     {/* <Typography color={Grey} family={'Montserrat-Medium'} size={scalable(16)}>location</Typography> */}
   </View>


  


   <View style={{ flexDirection:'row',justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: blockMargin * 2, marginBottom: blockMargin * 1.2 , marginRight: blockMargin }}>
     <TouchableOpacity
       onPress={() =>  this.setState({isQuit: false})}
     >
       <Typography color={'#222222'} family={'Montserrat-Medium'} style={{marginRight:blockMargin *2}} size={scalable(14)}>CANCEL</Typography>
     </TouchableOpacity>

     <TouchableOpacity
       onPress={() =>  this.onPressLiveStreamButton()}
     >
       <Typography color={'#222222'} family={'Montserrat-Medium'} style={{marginRight:blockMargin }} size={scalable(14)}>OK</Typography>
     </TouchableOpacity>
   </View>

 </View>

</View>
</BottomSheet>
    
        </View>
      </SafeAreaView>
    );
  }
}

// Component Properties
LiveStream.propTypes = {
  messageShow: PropTypes.func.isRequired,
};

// Component State
function liveStreamState(state) {
  return {
    // services: state.services,
    // settings: state.settings
  };
}

export default connect(liveStreamState, {
  messageShow,
})(withNavigation(LiveStream));
