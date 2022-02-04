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
} from '../../../ui/common/responsive';
import {white} from '../../../ui/common/colors';
import stylesCommon from '../../../ui/common/styles';

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
  container: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  blackContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundContainer: {
    flex: 1,
  },
  playerView: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  wrapperCenterTitle: {
    flex: 1,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '400',
  },
  btnClose: {
    position: 'absolute',
    top: 55,
    left: 15,
  },
  icoClose: {
    width: 30,
    height: 30,
  },
});
