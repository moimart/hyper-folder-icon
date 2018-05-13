const iconFinder = require('./iconfinder').iconFinder;
const { exec } = require('child_process');

const defaultIcon = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

exports.decorateConfig = (config) => {
    return Object.assign({}, config, {
        css: `
            ${config.css || ''}
            .folder_icon {
              display: inline-flex;
              float: left;
              margin-top: -30px;
              margin-left: 10%;
            }
        `
    });
};

const localCwd = (cwd) => new Promise((resolve,reject) => {

  let resolveHome = (filepath) => {
      if (filepath[0] === '~') {
          return path.join(process.env.HOME, filepath.slice(1));
      }
      return filepath;
  }

  iconFinder(resolveHome(cwd))
  .then(icon => resolve(Buffer.from(icon).toString('base64')))
  .catch(error => reject(defaultIcon));
});

exports.decorateTab = (Tab, { React }) => {
    return class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = {
                cwd: '',
                iconData: defaultIcon
            };
        }

        render() {
            return (
              React.createElement(Tab, Object.assign({},this.props,{
                customChildren: React.createElement('div',{},
                  React.createElement('img', {className: 'folder_icon', width: 24, height: 24, src:"data:image/png;base64," + this.state.iconData})
                )
              })));
        }

        componentDidMount() {
          localCwd(this.props.text)
          .then((icon) => {
            this.setState({
              cwd: this.props.text,
              iconData: icon
            });
          })
          .catch((icon) => {
            this.setState({
              cwd: this.props.text,
              iconData: icon
            });
          });
        }

        componentDidUpdate(prevProps,prevState) {

          if (prevProps.text !== this.props.text) {
            localCwd(this.props.text)
            .then((icon) => {
              this.setState({
                cwd: this.props.text,
                iconData: icon
              });
            })
            .catch((icon) => {
              this.setState({
                cwd: this.props.text,
                iconData: icon
              });
            });
          }
        }
    };
};

exports.decorateTabs = (Tabs, { React }) => {
  return class extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            iconData: defaultIcon
        };
    }

    componentDidUpdate(prevProps,prevState) {

      const { tabs } = this.props;

      if (tabs.length === 1 && tabs[0].title !== undefined) {
        localCwd(tabs[0].title)
        .then((icon) => {
          this.setState({
            iconData: icon
          });
        })
        .catch((icon) => {
          this.setState({
            iconData: icon
          });
        });
      }
    }

    render() {
      const { tabs } = this.props;

      let newProps = this.props;

      if (tabs.length === 1) {
        newProps = Object.assign({},this.props,{
          customChildren: React.createElement('div',{},
            React.createElement('img', {className: 'folder_icon', width: 24, height: 24, src:"data:image/png;base64," + this.state.iconData})
          )
        });
      }

      return (
        React.createElement(Tabs, newProps)
      );
    }
  }
};
