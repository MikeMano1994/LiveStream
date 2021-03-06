// Imports
import { StyleSheet } from 'react-native'

// UI Imports
import { black, grey1, grey6, white } from '../common/colors'
import {
  blockMargin,
  blockMarginHalf,
  blockPadding,
  blockPaddingHalf,
  itemRadius,
  itemRadiusHalf
} from '../common/responsive'
import styles from '../../modules/common/Body/styles'

// Styles
const shadow = {
  shadowColor: black,
  shadowOffset: {
    width: 0,
    height: 10
  },
  shadowRadius: 10,
  shadowOpacity: 0.25,
  elevation: 5
}

const shadowMedium = {
  shadowColor: black,
  shadowOffset: {
    width: 0,
    height: 5
  },
  shadowRadius: 5,
  shadowOpacity: 0.25,
  elevation: 3
}

const shadowSubtle = {
  shadowColor: black,
  shadowOffset: {
    width: 0,
    height: 3
  },
  shadowRadius: 2,
  shadowOpacity: 0.10,
  elevation: 2
}

const shadowItem = {
  shadowColor: black,
  shadowOffset: {
    height: 1
  },
  shadowRadius: 5,
  shadowOpacity: 0.1,
  elevation: 2
}

const shadowItemSubtle = {
  shadowColor: black,
  shadowOffset: {
    height: 1
  },
  shadowRadius: 5,
  shadowOpacity: 0.10,
  elevation: 1
}

// Styles
export default StyleSheet.create({
  flex: {
    flex: 1
  },

  flexGrow: {
    flexGrow: 1
  },

  flexDirectionRow: {
    flexDirection: 'row'
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  divider: {
    height: 1,
    width: '90%',
    marginTop: blockMargin,
    marginLeft: blockMargin,
    backgroundColor: grey6
  },

  
  dividerCard: {
    height: 1,
    width: '90%',
    marginTop: blockPaddingHalf,
    marginLeft: blockMargin,
    backgroundColor: grey6
  },

  // Form
  form: {
    backgroundColor: white,
    borderRadius: itemRadiusHalf,
    width: '100%',
    ...shadowSubtle
  },
  formRounded: {
    backgroundColor: white,
    borderRadius: itemRadiusHalf,
    width: '100%',
    ...shadowItem
  },
  formCta: {
    marginTop: blockMargin * 3
  },

  // Tab
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: blockPadding,
    backgroundColor: grey1,
    ...shadowSubtle
  },
  tabBarItem: {
    paddingHorizontal: blockPaddingHalf,
    paddingVertical: blockPadding,
    alignItems: 'center'
  },

  // Text
  bullet: {
    marginHorizontal: blockMarginHalf
  },

  // Shadow
  shadow,
  shadowSubtle,
  shadowMedium,
  shadowItem,
  shadowItemSubtle
})

// Others
export const gradient = {
  colors: ['#fafafa', '#d6d6d6'],
  start: { x: 1, y: 0 },
  end: { x: 0, y: 1 },
  style: styles.gradient
}
