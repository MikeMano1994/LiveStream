// Imports
import {StyleSheet} from 'react-native';

// UI Imports
import {
  blockMargin,
  blockMarginHalf,
  blockPaddingHalf,
  itemRadiusHalf,
  navigationTopHeight,
  scalable,
  deviceHeight,
  deviceWidth,
  itemRadius,
} from '../responsive';
import {white} from '../colors';
import stylesCommon from '../styles';

// Styles
export default StyleSheet.create({
  container: {
    flex: 1,
  },

  logo: {
    width: scalable(60),
    height: scalable(60),
    marginLeft: blockMargin,
  },
  profileImage: {
    width: scalable(25),
    height: scalable(25),
    marginRight: blockMargin,
    borderRadius: scalable(15),
  },

  products: {
    marginTop: blockMargin,
  },

  productItem: {
    backgroundColor: white,
    justifyContent: 'center',
    borderRadius: itemRadiusHalf,
    overflow: 'visible',
    ...stylesCommon.shadowItemSubtle,
    width: scalable(140) + blockPaddingHalf * 2,
  },
  productItemContent: {
    padding: blockPaddingHalf,
  },
  productItemImage: {
    width: scalable(140),
    height: scalable(140),
    backgroundColor: white,
    marginBottom: blockMarginHalf,
    borderRadius: itemRadiusHalf / 2,
  },
  MainContainer: {
    flex: 1,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    backgroundColor: '#E0F7FA',
  },
  bottomNavigationView: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: 550,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  gridView: {
    marginTop: 20,
  },
  popularservice: {
    marginTop: 5,
  },
  itemContainer: {
    justifyContent: 'flex-start',
    borderRadius: 15,
    marginLeft: blockMarginHalf,
    height: (deviceHeight / 100) * 13,
    width: (deviceWidth / 100) * 27,
  },
  itemName: {
    marginLeft: blockMargin * 1.3,
    marginTop: blockMarginHalf,
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },
  itemIcon: {
    marginTop: blockMargin,
    marginLeft: blockMargin * 2.5,
  },
  image: {
    marginTop: blockMargin,
    marginLeft: blockMarginHalf,
    borderRadius: itemRadiusHalf,
    width: scalable(75),
    height: scalable(55),
  },
  contentWrapper: {flex: 1},
  header: {flex: 0.2, justifyContent: 'space-around'},
  footer: {flex: 0.7},
  center: {flex: 0.1},
  streamerView: {
    position: 'absolute',
    top: 0,
    left: 0,bottom:0,right:0,
    height: deviceHeight,
    width: '100%',
  },
  btnClose: {position: 'absolute', top: 15, left: 15},
  icoClose: {width: 28, height: 28},
  bottomGroup: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  btnBeginLiveStream: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
    paddingVertical: 5,
  },
  beginLiveStreamText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
