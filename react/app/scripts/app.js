/** @jsx React.DOM */

var React = window.React = require('react'),
	mountNode = document.getElementById("app");

var BootstrapModalMixin = function() {
	var handlerProps = ['handleShow', 'handleShown', 'handleHide', 'handleHidden']

	var bsModalEvents = {
		handleShow: 'show.bs.modal',
		handleShown: 'shown.bs.modal',
		handleHide: 'hide.bs.modal',
		handleHidden: 'hidden.bs.modal'
	}

	return {
		propTypes: {
			handleShow: React.PropTypes.func,
			handleShown: React.PropTypes.func,
			handleHide: React.PropTypes.func,
			handleHidden: React.PropTypes.func,
			backdrop: React.PropTypes.bool,
			keyboard: React.PropTypes.bool,
			show: React.PropTypes.bool,
			remote: React.PropTypes.string
		},
		getDefaultProps: function() {
			return {
				backdrop: true,
				keyboard: true,
				show: true,
				remote: ''
			}
		},
		componentDidMount: function() {
			var $modal = $(this.getDOMNode()).modal({
				backdrop: this.props.backdrop,
				keyboard: this.props.keyboard,
				show: this.props.show,
				remote: this.props.remote
			});
			handlerProps.forEach(function(prop) {
				if (this[prop]) {
					$modal.on(bsModalEvents[prop], this[prop])
				}
				if (this.props[prop]) {
					$modal.on(bsModalEvents[prop], this.props[prop])
				}
			}.bind(this));
		},
		componentWillUnmount: function() {
			var $modal = $(this.getDOMNode())
			handlerProps.forEach(function(prop) {
				if (this[prop]) {
					$modal.off(bsModalEvents[prop], this[prop])
				}
				if (this.props[prop]) {
					$modal.off(bsModalEvents[prop], this.props[prop])
				}
			}.bind(this));
		},
		hide: function() {
			$(this.getDOMNode()).modal('hide');
		},
		show: function() {
			$(this.getDOMNode()).modal('show');
		},
		toggle: function() {
			$(this.getDOMNode()).modal('toggle');
		},
		renderCloseButton: function() {
			return <button
				type="button"
				className="close"
				onClick={this.hide}
				dangerouslySetInnerHTML={{__html: '&times'}}>
				</button>
		}
	}
}();

var ProjectModal = React.createClass({
	mixins: [BootstrapModalMixin],
	render: function() {
		var buttons = this.props.buttons.map(function(button) {
			return <button type="button" className={'btn btn-' + button.type} onClick={button.handler}>
				{button.text}
			</button>
		})
		return <div className="modal fade">
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header">
						{this.renderCloseButton()}
						<strong>{this.props.header}</strong>
					</div>
					<div className="modal-body">
						{this.props.children}
					</div>
					<div className="modal-footer">
						{buttons}
					</div>
				</div>
			</div>
		</div>
	}
});

var Project = React.createClass({
	detail: function() {
		this.refs.modal.show();
	},
	render: function() {
		var buttons = [
			{
				type: 'default',
				text: 'OK',
				handler: this.handleExternalHide
			}
		];
		return <div key={this.props.project.id} className="col-md-4">
			<div className="project">
				<a onClick={this.detail}><h4>{this.props.project.name}</h4></a>
				<div>{this.props.project.description}</div>
				<ProjectModal ref="modal" show={false} header={this.props.project.name} buttons={buttons}>
					<div className="row">
						<div className="col-md-2">Forks</div>
						<div className="col-md-4">{this.props.project.forks_count}</div>
					</div>
					<div className="row">
						<div className="col-md-2">Size</div>
						<div className="col-md-4">{this.props.project.size}</div>
					</div>
					<div className="row">
						<div className="col-md-2">Score</div>
						<div className="col-md-4">{this.props.project.score}</div>
					</div>
					<div className="row">
						<div className="col-md-2">Watchers</div>
						<div className="col-md-4">{this.props.project.watchers_count}</div>
					</div>
					<div className="row">
						<div className="col-md-2">Link</div>
						<div className="col-md-4"><a href={this.props.project.url}>More info...</a></div>
					</div>
				</ProjectModal>
			</div>
		</div>;
	},
	handleExternalHide: function() {
		this.refs.modal.hide();
	}
});

var ProjectRow = React.createClass({
	render: function() {
		var createItem = function(project) {
			return <Project project={project} />;
		};
		return <div className="row">{this.props.row.map(createItem)}</div>;
	}
});

var ProjectList = React.createClass({
	render: function() {
		var projects = [];
		var block = [];
		var id = 0;
		for( var i in this.props.items ) {
			this.props.items[i].id = id++;
			block.push( this.props.items[i] );
			if ( block.length >= 3 ) {
				projects.push( block );
				block = [];
			}
		}
		if ( block.length > 0 ) {
			projects.push( block );
		}
		var createItem = function(row) {
			return <ProjectRow row={row} />;
		};
		return <div>{projects.map(createItem)}</div>;
	}
});

var GithupProjectApp = React.createClass({
	getInitialState: function() {
		return {items: [], text: '', disabled: true};
	},
	onChange: function(e) {
		this.setState({text: e.target.value});
		var disabled = true;
		if ( e.target.value !== undefined ) {
			if ( e.target.value.length > 0 ) {
				if( ! e.target.value.match(/\//) ) {
					disabled = false;
				}
			}
		}
		this.setState({disabled:disabled});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var self = this;
		$.get('https://api.github.com/search/repositories', { q: this.state.text } )
		.done( function( data ) {
			self.setState({items: data.items});
		});
	},
	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-sm-11">
						<input className="form-control" onChange={this.onChange} value={this.state.text} />
					</div>
					<div className="col-sm-1">
						<button className="btn btn-default" onClick={this.handleSubmit} disabled={this.state.disabled}>Search</button>
					</div>
				</div>
				<ProjectList items={this.state.items} />
			</div>
		);
	}
});

React.renderComponent(<GithupProjectApp />, mountNode);
