
import layoutNode from '../layout'
import renderToSVG from '../svg/tree-to-svg'
import renderToCanvas from '../canvas'

import * as React from "react"
import { View, Image, Text } from "react-native"
import * as renderer from "react-test-renderer"

import * as fs from 'fs'

describe("Counting nodes", () => {
    it("it is good with memory", () => {

      const jsx =
        <View style={{
          flex: 1,
          borderWidth: 1,
          borderColor: 'red',
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Image source={require('./example.png')} />
        <Text>Hello folks</Text>
        <View style={{width: 50, height: 50, backgroundColor: "powderblue"}} />
        <Text style={{maxWidth: 100}}>
          Ok <Text style={{fontWeight: "bold"}}>here</Text> is something <Text style={{fontStyle: 'italic'}}>long that </Text>is going to wrap for me.
        </Text>
        <View style={{width: 50, height: 50, backgroundColor: "skyblue"}} />
        <View style={{width: 50, height: 50, backgroundColor: "steelblue",
          borderBottomWidth: 10,
          borderColor: 'yellow',
          borderWidth: 2,
        }} />
        <View style={{padding: 10, backgroundColor: 'green', borderRadius: 10}}>
          <View style={{padding: 10, backgroundColor: 'blue', borderRadius: 100, borderColor: 'orange', borderWidth: 2}}>
          </View>
        </View>
      </View>

      const component = renderer.create(jsx).toJSON()
      expect(component).toMatchSnapshot()
      const fontCache = {fonts: {}, fallbacks: {}}
      console.log(__dirname)
      const settings = {width: 320, height: 480, fontCache: fontCache, basePath: __dirname + '/../../'}
      const node = layoutNode(component, settings)
      const svg = renderToSVG(node, settings)
      fs.writeFileSync(__dirname + '/Basic.test.svg', svg)
      renderToCanvas(__dirname + '/Basic.test.png', node, settings)
      // expect(component).toMatchSVGSnapshot(320, 480)
    })
})

