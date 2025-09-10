/**
 * As we do not have multiple inheritence in here, we cascade the the inheritence down
 *
 * OLD: Controller -> SVgController -> DesignToken -> Widget -> Screen -> CopyPaste -> Group -> Layer -> Templates ->BaseController
 * NEW: Controller -> QSSController -> Widget -> Screen -> CopyPaste -> Group -> Layer -> Templates -> Command -> BaseController
 */
//import SVGController from './SVGController'
import Data from './Data'


export default class Controller extends Data {

}