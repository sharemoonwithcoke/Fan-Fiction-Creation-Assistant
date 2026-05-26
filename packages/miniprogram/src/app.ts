import Taro from '@tarojs/taro'

export default class App extends Taro.Component {
  componentDidMount() {}
  componentDidShow() {}
  componentDidHide() {}

  render() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.props as any).children
  }
}
