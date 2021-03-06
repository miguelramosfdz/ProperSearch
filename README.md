# ProperSearch

[![Build Status](https://travis-ci.org/CBIConsulting/ProperSearch.svg)](https://travis-ci.org/CBIConsulting/ProperSearch)

A proper search component for react. With a search field and a list of items allows the user to filter that list and select the items. The component return the
selected data when it get selected. Allows multi and single selection. The list is virtual rendered, was designed to handle thousands of items without sacrificing
performance, only render the items in the view. Use react-virtualized to render the list items. This component has a lot of configurable settings, read the
component properties section for more info.

Used technologies:

- React
- ES6
- Webpack
- Babel
- Node
- Compass
- Jasmine
- Karma



Features of ProperSearch:

* Data selection allowed from a list
* List filtering on search
* Allow multi and single selection
* Return the selection
* List virtual rendered


The compile and compressed ProperSearch distribution file can be found in the dist folder along with the css file. Add the default stylesheet `dist/propersearch.min.css`, then import it into any module.

## Live Demo
##### [Code](https://github.com/CBIConsulting/ProperSearch/tree/gh-pages/examples/jsx/app.js)
##### [Demo](http://cbiconsulting.github.io/ProperSearch/)


## External dependencies
* React and React DOM
* Underscore


## Preview
![screen shot 2016-04-04 at 11 40 00](examples/screenshots/example.png "Example of ProperSearch with multiselect")

## Use this module in your projects
```
npm install react-propersearch --save
```

## How to start

Run:
```
npm install
npm start
```

Check your http://localhost:8080/ or  `open http://localhost:8080/`

## How to test

`npm test`

### Component properties
* data: List data. (Array) (You can send data as an Inmutable but it should have a similar structure to the procesed data in method prepareData() [src/search::445](https://github.com/CBIConsulting/ProperSearch/tree/dev/src/jsx/components/search.js), and in this case don't forget to send indexed and rawdata too. It's not recomended)
 	* value: Id field name. (String)
 	* label: Name of the field to be displayed (String)
* messages: Get the translated messages of the lang selected in the property lang. Default ENG (An example can be found in src/lang)
	* Default:
	```javascript
		'ENG': {
			all: 'Select All',
			none: 'Unselect All',
			loading: 'Loading...',
			noData:'No data found'
		}
	```
* lang: Language for the component (String)
* allowsEmptySelection: The empty string values will never be rendered into the list but if you set this prop to true then a new button will appear. When you click that button ('Select Empty') you'll get selection => [''] and the data array with all the elements that has empty values in idField or displayField
* rowFormater: Process the data of each element of the list, it's a function that get the value, it should return the value formated. (NOTE: If the element it's a function then this prop does nothing)
* defaultSelection: Items of the list selected by default. (String or Array)
* multiSelect: Type of the selection, multiple or single (Boolean)
* listWidth: Custom width for the list under the search field (Integer) Default component's width.
* listHeight: Height of the list. Default 200 (Integer)
* listRowHeight: Height of each row of the list
* afterSelect: Function called after select a row. Return the seleted rows.
	* Ex:
	```javascript
		afterSelect ={
			function(data, selection){
				console.info(data); // Selected data
				console.info(selection); // Array of selected values
			}
		}
	```
* afterSearch: Function called after type something into the search field. Return the written string.
	* Ex:
	```javascript
		afterSearch={
			function(search_string) {
				console.info('Filtering by: ', search_string);
			}
		}
	```
* afterSelectGetSelection: Function called after select a row. This one works same as afterSelec(data, selection) but is faster because doesn't work over data, only get selection instead. If you are working with large amount of data and just need the id's this one is more optimal.
	* Ex:
	```javascript
		afterSelectGetSelection={
			function(selectionAsArray, selectionAsSetObj) {
				console.info(selectionAsArray); // Array of selected values (idField)
				console.info(selectionAsSetObj); // Set object which contains selected values (idField)
			}
		}
	```
* fieldClass: ClassName for the search field (String)
* listClass: ClassName for the list (String)
* listElementClass: ClassName for each element of the list (String)
* className: ClassName for the component container (String)
* placeholder: Placeholder for the search field (String) Default 'Search...'
* searchIcon: ClassName for the search icon in the left of the search field (String) Default 'fa fa-search fa-fw' (FontAwesome)
* clearIcon: ClassName for the clear icon (X) in the right side of the search field. (String) Default 'fa fa-times fa-fw' (FontAwesome)
* throttle: Time between filtering action and the next. It affects to the search input onChange method setting an timeout (Integer) Default 160
* minLength: Min. length of the search input to start filtering. (Integer) Default 3
* onEnter: Custom function to be called on Enter key up.
* idField: Name of the field that will be used to build the selection. Default 'value'
	* Ex:
	```javascript
		let data = [];
		data.push(value:'3', label: 'Orange', price: '9', kg: 200);

		<Search
			...
			idField='value'
			...
		/>

		Selecting Orange you ill get a selection -> [3] and data -> [{value:'3', label: 'Orange', price: '9', kg: 200}]
	```
* displayField: Field of the data which should be used to display each element of the list. It can be a string or a function, just remenber to set the showIcon property to false if you are using another component and then only that component will be rendered inside each list element. Default: 'label'.
	* Ex:
	```javascript
		let buttonClick = (e, name) => {
			alert('Button ' + name + ' has been clicked');
		}

		let formater = listElement => {
			return <button className ="btn btn-default" onClick={ (e) => {buttonClick(e, listElement.name)} }>{ listElement.name }</button>;
		}

		let data = [];
		data.push(id:'16', display: formater, name: 'test 1');

		<Search
			...
			idField={'id'}
			displayField={'display'}
			...
		/>
	```
* listShowIcon: If the checked icon on the left of each list element must be printed or not
* autoComplete: If the search field has autocomplete 'on' or 'off'. Default 'off'
* defaultSearch: Set a default searching string to search input when the components get mounted or this prop is updated.
* indexed: In case you want to use your own data (it has to be an Immutable obj) you must send indexed data by its idField.
* rawdata: In case you want to use your own data (it has to be an Immutable obj) you must send raw data. (the data you'll get when someone clicks in list)
* filterField: Field used for filtering on search input change.
* filter: Function to filter on type something in the search input. By default the data will be filtered by its displayfield, if displayfield is a function then by it's name, if name doesn't exist then by its idField. (Important: If you set filterField then the data will be filter by the field you have chosen). Note: if you use the filter then you'll get each element of list and the search input value, then you can filter that data in the way you wanted). The search value it's normalized.
	* Ex:
	```javascript
	let filter = (listElement, searchValue) => {
		let data = listElement.name.toLowerCase();
		data = Normalizer.normalize(data);
		return data.indexOf(searchValue) >= 0;
	}

	let buttonClick = (e, name) => {
		alert('Button ' + name + ' has been clicked');
	}

	let formater = listElement => {
		return <button className ="btn btn-default" onClick={ (e) => {buttonClick(e, listElement.name)} }>{ listElement.name }</button>;
	}

	let data = [];
	data.push(id:'16', display: formater, name: 'test 1');

	<Search
		...
		idField={'id'}
		displayField={'display'}
		filter={filter}
		...
	/>
* hiddenSelection: Thats the selection of what elements should not be displayed. It's an array, string, number or Set obj of the data ids (idField).

```
### Basic Example

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import ProperSearch from 'react-propercombo';

// Function Called after select items in the list.

const afterSelect = (data, selection) => {
	console.info(data);
	console.info(selection);
}

// List data
const data = [];

for (var i = 10000; i >= 0; i--) {
	data.push({value: 'item-' + i, label: 'Item ' + i});
}

// Render the Search component
ReactDOM.render(
	<Search
		data={data}
		multiSelect={true}
		afterSelect={afterSelect}
	/>,
	document.getElementById('example')
);
```


Contributions
------------

Use [GitHub issues](https://github.com/CBIConsulting/ProperSearch/issues) for requests.

Changelog
---------

Changes are tracked as [GitHub releases](https://github.com/CBIConsulting/ProperSearch/releases).
