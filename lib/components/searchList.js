'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _reactImmutableRenderMixin = require('react-immutable-render-mixin');

var _reactVirtualized = require('react-virtualized');

var _reactDimensions = require('react-dimensions');

var _reactDimensions2 = _interopRequireDefault(_reactDimensions);

var _cache = require('../lib/cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Set = require('es6-set');

// For more info about this read ReadMe.md
function getDefaultProps() {
	return {
		data: null,
		indexedData: null, // Just when you use a function as a display field. (array) (Full indexed data not filted)
		onSelectionChange: null,
		rowFormater: null, // function
		multiSelect: false,
		messages: null,
		selection: new Set(),
		allSelected: false,
		listRowHeight: 26,
		listHeight: 200,
		listWidth: 100, // Container width by default
		idField: 'value',
		displayField: 'label',
		showIcon: true,
		listElementClass: null,
		allowsEmptySelection: false,
		hiddenSelection: null,
		uniqueID: null
	};
}

/**
 * A Component that render a list of selectable items, with single or multiple selection and return the selected items each time a new item be selected.
 *
 * Simple example usage:
 *	let handleSelection = function(selection){
 *		console.log('Selected values: ' + selection) // The selection is a Set obj
 *	}
 *
 * 	<SearchList
 *		data={data} // As an Inmutable obj
 *		idField={'value'} // Field used as an id
 *		onSelectionChange={handleSelection}
 * 		multiselect={false}
 *	/>
 * ```
 */

var SearchList = function (_React$Component) {
	_inherits(SearchList, _React$Component);

	function SearchList(props) {
		_classCallCheck(this, SearchList);

		var _this = _possibleConstructorReturn(this, (SearchList.__proto__ || Object.getPrototypeOf(SearchList)).call(this, props));

		_this.state = {
			allSelected: props.allSelected,
			nothingSelected: props.selection.size == 0,
			hiddenSelection: new Set()
		};
		return _this;
	}

	_createClass(SearchList, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.uniqueId = this.props.uniqueID ? this.props.uniqueID : _underscore2['default'].uniqueId('search_list_');
			if (this.props.hiddenSelection) {
				this.setState({
					hiddenSelection: this.parseHiddenSelection(this.props)
				});
			}
		}
	}, {
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate(nextProps, nextState) {
			var propschanged = !(0, _reactImmutableRenderMixin.shallowEqualImmutable)(this.props, nextProps);
			var stateChanged = !(0, _reactImmutableRenderMixin.shallowEqualImmutable)(this.state, nextState);
			var somethingChanged = propschanged || stateChanged;

			if (propschanged) {
				var nothingSelected = false;

				if (!nextProps.allSelected) nothingSelected = this.isNothingSelected(nextProps.data, nextProps.selection);

				// When the props change update the state.
				if (nextProps.allSelected != this.state.allSelected || nothingSelected != this.state.nothingSelected) {
					this.setState({
						allSelected: nextProps.allSelected,
						nothingSelected: nothingSelected
					});
				}
			}

			return somethingChanged;
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(newProps) {
			var hiddenChange = !(0, _reactImmutableRenderMixin.shallowEqualImmutable)(this.props.hiddenSelection, newProps.hiddenSelection);
			var hiddenSelection = undefined;

			if (hiddenChange) {
				if (this._virtualScroll) this._virtualScroll.recomputeRowHeights(0);
				hiddenSelection = this.parseHiddenSelection(newProps);
				this.setState({
					hiddenSelection: hiddenSelection
				});
			}
		}

		/**
   * Function called each time an element of the list is selected. Get the value (value of the idField) of the
   * element that was selected, them change the selection and call to onSelectionChange function in the props sending
   * the new selection.
   *
   * @param (String)	itemValue 	Value of the idField of the selected element
   * @param (Array)	e 			Element which call the function
   */

	}, {
		key: 'handleElementClick',
		value: function handleElementClick(itemValue, e) {
			e.preventDefault();
			var data = this.props.data,
			    selection = this.props.selection,
			    nothingSelected = false,
			    allSelected = false;

			if (this.props.multiSelect) {
				if (selection.has(itemValue)) {
					selection['delete'](itemValue);
				} else {
					selection.add(itemValue);
				}
			} else {
				if (selection.has(itemValue)) selection = new Set();else selection = new Set([itemValue]);
			}

			allSelected = this.isAllSelected(data, selection);
			if (!allSelected) nothingSelected = this.isNothingSelected(data, selection);

			// If the state has changed update it
			if (allSelected != this.state.allSelected || nothingSelected != this.state.nothingSelected) {
				this.setState({
					allSelected: allSelected,
					nothingSelected: nothingSelected
				});
			}

			if (typeof this.props.onSelectionChange == 'function') {
				this.props.onSelectionChange.call(this, selection);
			}
		}

		/**
   * Check if all the current data are not selected
   *
   * @param (array)	data		The data to compare with selection
   * @param (object)	selection	The current selection Set of values (idField)
   */

	}, {
		key: 'isNothingSelected',
		value: function isNothingSelected(data, selection) {
			var _this2 = this;

			var result = true;
			if (selection.size == 0) return true;

			data.forEach(function (element) {
				if (selection.has(element.get(_this2.props.idField, null))) {
					// Some data not in selection
					result = false;
					return false;
				}
			});

			return result;
		}

		/**
   * Check if all the current data are selected.
   *
   * @param (array)	data		The data to compare with selection
   * @param (object)	selection	The current selection Set of values (idField)
   */

	}, {
		key: 'isAllSelected',
		value: function isAllSelected(data, selection) {
			var _this3 = this;

			var result = true;
			if (data.size > selection.size) return false;

			data.forEach(function (element) {
				if (!selection.has(element.get(_this3.props.idField, null))) {
					// Some data not in selection
					result = false;
					return false;
				}
			});

			return result;
		}

		/**
   * Function called each time the buttons in the bar of the list has been clicked. Delete or add all the data elements into the selection, just if it has changed.
   *
   * @param (Boolean)	selectAll 	If its a select all action or an unselect all.
   * @param (Array)	e 			Element which call the function
   */

	}, {
		key: 'handleSelectAll',
		value: function handleSelectAll(selectAll, e) {
			e.preventDefault();

			var newData = [],
			    data = this.props.data,
			    field = this.props.idField;
			var selection = this.props.selection;
			var hasChanged = selectAll != this.state.allSelected || !selectAll && !this.state.nothingSelected; // nothingSelected = false then something is selected

			if (selectAll && hasChanged) {
				data.forEach(function (element) {
					selection.add(element.get(field, null));
				});
			} else {
				data.forEach(function (element) {
					selection['delete'](element.get(field, null));
				});
			}

			if (hasChanged) {
				this.setState({
					allSelected: selectAll,
					nothingSelected: !selectAll
				});
			}

			if (typeof this.props.onSelectionChange == 'function' && hasChanged) {
				this.props.onSelectionChange.call(this, selection);
			}
		}

		/**
   * Function called each time the buttons (select empty) in the bar of the list has been clicked (In case empty selection allowed).
   *
   * @param (Array)	e 			Element which call the function
   */

	}, {
		key: 'handleSelectEmpty',
		value: function handleSelectEmpty(e) {
			if (typeof this.props.onSelectionChange == 'function') {
				this.props.onSelectionChange.call(this, null, true);
			}
		}

		/**
   * Parse the hidden selection if that property contains somethings.
   *
   * @param (array)	props 				Component props (or nextProps)
   * @return (Set)	hiddenSelection 	The hidden rows.
   */

	}, {
		key: 'parseHiddenSelection',
		value: function parseHiddenSelection() {
			var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

			var hidden = [],
			    isArray = _underscore2['default'].isArray(props.hiddenSelection),
			    isObject = _underscore2['default'].isObject(props.hiddenSelection);

			if (!isArray && isObject) return props.hiddenSelection; // Is Set

			if (!isArray) {
				// Is String or number
				hidden = [props.hiddenSelection.toString()];
			} else if (props.hiddenSelection.length > 0) {
				// Is Array
				hidden = props.hiddenSelection.toString().split(',');
			}

			return new Set(hidden);
		}

		/**
   * Return the tool bar for the top of the list. It will be displayed only when the selection can be multiple.
   *
   * @return (html) 	The toolbar code
   */

	}, {
		key: 'getToolbar',
		value: function getToolbar() {
			var maxWidth = this.props.containerWidth ? this.props.containerWidth / 2 - 1 : 100;

			return _react2['default'].createElement(
				'div',
				{ className: 'proper-search-list-bar' },
				_react2['default'].createElement(
					'div',
					{ className: 'btn-group form-inline' },
					_react2['default'].createElement(
						'a',
						{
							id: 'proper-search-list-bar-check',
							className: 'btn-select list-bar-check', role: 'button',
							onClick: this.handleSelectAll.bind(this, true),
							style: { maxWidth: maxWidth, boxSizing: 'border-box' } },
						_react2['default'].createElement(
							'label',
							null,
							this.props.messages.all
						)
					),
					_react2['default'].createElement(
						'a',
						{
							id: 'proper-search-list-bar-unCheck',
							className: 'btn-select list-bar-unCheck',
							role: 'button',
							onClick: this.handleSelectAll.bind(this, false),
							style: { maxWidth: maxWidth, boxSizing: 'border-box' } },
						_react2['default'].createElement(
							'label',
							null,
							this.props.messages.none
						)
					)
				)
			);
		}

		/**
   * Return the tool bar for the top of the list in case Empty Selection allowed
   *
   * @return (html) 	The toolbar code
   */

	}, {
		key: 'getToolbarForEmpty',
		value: function getToolbarForEmpty() {
			var allSelected = this.state.allSelected,
			    selectMessage = undefined,
			    maxWidth = this.props.containerWidth / 2 - 1;
			selectMessage = allSelected ? this.props.messages.none : this.props.messages.all;

			return _react2['default'].createElement(
				'div',
				{ className: 'proper-search-list-bar' },
				_react2['default'].createElement(
					'div',
					{ className: 'btn-group form-inline' },
					_react2['default'].createElement(
						'a',
						{
							id: 'proper-search-list-bar-select',
							className: 'btn-select list-bar-select',
							role: 'button',
							onClick: this.handleSelectAll.bind(this, !allSelected),
							style: { maxWidth: maxWidth, boxSizing: 'border-box' } },
						_react2['default'].createElement(
							'label',
							null,
							selectMessage
						)
					),
					_react2['default'].createElement(
						'a',
						{
							id: 'proper-search-list-bar-empty',
							className: 'btn-select list-bar-empty',
							role: 'button',
							onClick: this.handleSelectEmpty.bind(this),
							style: { maxWidth: maxWidth, boxSizing: 'border-box' } },
						_react2['default'].createElement(
							'label',
							null,
							this.props.messages.empty
						)
					)
				)
			);
		}

		/**
   * Build and return the content of the list.
   *
   * @param (object) 	contentData
   * 							- index (integer) 		Index of the data to be rendered
   * 							- isScrolling (bool) 	If grid is scrollings
   * @return (html)	list-row 	A row of the list
   */

	}, {
		key: 'getContent',
		value: function getContent(contentData) {
			var index = contentData.index;
			var icon = null,
			    selectedClass = null,
			    className = null,
			    element = null,
			    listElementClass = this.props.listElementClass;
			var data = this.props.data,
			    rowdata = undefined,
			    id = undefined,
			    displayField = this.props.displayField,
			    showIcon = this.props.showIcon;

			rowdata = data.get(index);
			element = rowdata.get(displayField);
			className = "proper-search-list-element";
			id = rowdata.get(this.props.idField);

			if (this.props.multiSelect) {
				if (showIcon) {
					if (rowdata.get('_selected', false)) {
						icon = _react2['default'].createElement('i', { className: 'fa fa-check-square-o' });
						selectedClass = ' proper-search-selected';
					} else {
						icon = _react2['default'].createElement('i', { className: 'fa fa-square-o' });
						selectedClass = null;
					}
				}
			} else {
				if (rowdata.get('_selected')) selectedClass = ' proper-search-single-selected';else selectedClass = null;
			}

			if (listElementClass) {
				className += ' ' + listElementClass;
			}

			if (selectedClass) {
				className += ' ' + selectedClass;
			}

			if (typeof element == 'function') {
				element = element(this.props.indexedData[id]);
			} else if (this.props.rowFormater) {
				var ckey = ['search_list', 'list_' + this.uniqueId, 'row__' + rowdata.get(this.props.idField), displayField];
				element = _cache2['default'].read(ckey);

				if (element === undefined) {
					element = this.props.rowFormater(rowdata.get(displayField));
					_cache2['default'].write(ckey, element);
				}
			}

			return _react2['default'].createElement(
				'div',
				{ key: 'element-' + index, className: className, onClick: this.handleElementClick.bind(this, id) },
				icon,
				element
			);
		}
		/**
   * To be rendered when the data has no data (Ex. filtered data)
   *
   * @return (node) An div with a message
   */

	}, {
		key: 'noRowsRenderer',
		value: function noRowsRenderer() {
			return _react2['default'].createElement(
				'div',
				{ key: 'element-0', className: "proper-search-list search-list-no-data" },
				this.props.messages.noData
			);
		}

		/**
   * Function called to get the content of each element of the list.
   *
   * @param (object) 	contentData
   * 							- index (integer) 		Index of the data to be rendered
   * 							- isScrolling (bool) 	If grid is scrollings
   * @return  (node)		element 	The element on the index position
   */

	}, {
		key: 'rowRenderer',
		value: function rowRenderer(contentData) {
			return this.getContent(contentData);
		}

		/**
   *	Function that gets the height for the current row of the list.
   *
   * @param (object) 	rowData 	It's an object that contains the index of the current row
   * @return (integer) rowHeight  The height of each row.
   */

	}, {
		key: 'getRowHeight',
		value: function getRowHeight(rowData) {
			var id = this.props.data.get(rowData.index).get(this.props.idField);
			return this.state.hiddenSelection.has(id) ? 0 : this.props.listRowHeight;
		}
	}, {
		key: 'render',
		value: function render() {
			var _this4 = this;

			var toolbar = null,
			    rowHeight = this.props.listRowHeight,
			    className = "proper-search-list";

			if (this.props.multiSelect) {
				toolbar = this.props.allowsEmptySelection ? this.getToolbarForEmpty() : this.getToolbar();
			}

			if (this.props.className) {
				className += ' ' + this.props.className;
			}

			if (this.state.hiddenSelection.size > 0) {
				rowHeight = this.getRowHeight.bind(this);
			}

			return _react2['default'].createElement(
				'div',
				{ className: className },
				toolbar,
				_react2['default'].createElement(_reactVirtualized.VirtualScroll, {
					ref: function ref(_ref) {
						_this4._virtualScroll = _ref;
					},
					className: "proper-search-list-virtual",
					width: this.props.listWidth || this.props.containerWidth,
					height: this.props.listHeight,
					rowRenderer: this.rowRenderer.bind(this),
					rowHeight: rowHeight,
					noRowsRenderer: this.noRowsRenderer.bind(this),
					rowCount: this.props.data.size,
					overscanRowsCount: 5
				})
			);
		}
	}]);

	return SearchList;
}(_react2['default'].Component);

SearchList.defaultProps = getDefaultProps();
var toExport = process.env.NODE_ENV === 'Test' ? SearchList : (0, _reactDimensions2['default'])()(SearchList);
exports['default'] = toExport;
module.exports = exports['default'];