import React from 'react';
import ReactDOM from 'react-dom';

import scrollMonitor from 'scrollmonitor';

export const ScrollContainer = (Component) => class ScrollMonitorContainer extends React.Component {
	constructor () {
		super();

		this.state = {
			container: null
		};
	}

	componentDidMount () {
		var el = ReactDOM.findDOMNode(this);
		var container = scrollMonitor.createContainer(el, this.props.offsets);
		this.setState({
			scrollContainer: container
		});
	}

	render () {
		return (<Component
			scrollContainer={this.state.scrollContainer}
			{...this.props}
		>
			{this.props.children}
		</Component>);
	}
};

export const Watch = (Component) => class WatchedComponent extends React.Component {

	constructor () {
		super();

		this.state = {
			isInViewport: false,
			isAboveViewport: false,
			isBelowViewport: false,
			isFullyInViewport: false
		};
	}

	createWatcher (props) {
		var el = ReactDOM.findDOMNode(this);
		this.watcher = (props.scrollContainer || scrollMonitor).create(el, props.offsets);

		const updateState = () => {
			this.setState({
				isInViewport: this.watcher.isInViewport,
				isAboveViewport: this.watcher.isAboveViewport,
				isBelowViewport: this.watcher.isBelowViewport,
				isFullyInViewport: this.watcher.isFullyInViewport
			});
		};

		this.watcher.on('stateChange', updateState);

		this.listeners = {};

		scrollMonitor.eventTypes.forEach(type => {
			if (props[type]) {
				this.listeners[type] = () => this.props[type](this.watcher);
				this.watcher.on(type, this.listeners[type]);
			}
		});

		updateState();
	}

	componentDidMount () {
		this.createWatcher(this.props);
	}

	componentWillReceiveProps (props) {
		if (this.props.scrollContainer !== props.scrollContainer) {
			this.watcher.destroy();
			this.createWatcher(props);
		}
		scrollMonitor.eventTypes.forEach(type => {
			if (props[type] && !this.props[type]) {
				this.listeners[type] = () => this.props[type](this.watcher);
				this.watcher.on(type, this.listeners[type]);
			} else if (!props[type] && this.props[type]) {
				this.watcher.off(type, this.listeners[type]);
			}
		});
	}

	componentWillUnmount () {
		this.watcher.destroy()
	}

	lockWatcher = () => {
		this.watcher.lock();
	}

	unlockWatcher = () => {
		this.watcher.unlock();
	}

	render () {
		return (<Component
			{...{}}
			{...this.props}
			isInViewport={this.state.isInViewport}
			isAboveViewport={this.state.isAboveViewport}
			isBelowViewport={this.state.isBelowViewport}
			isFullyInViewport={this.state.isFullyInViewport}
			lockWatcher={this.lockWatcher}
			unlockWatcher={this.unlockWatcher}
		>
			{this.props.children}
		</Component>);
	}
};
