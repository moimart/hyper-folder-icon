const iconFinder = require('./iconfinder').iconFinder;
const defaultIcon = require('./defaultIcon').icon;
const path = require('path');

const localCwd = (cwd) => new Promise((resolve,reject) => {

  let resolveHome = (filepath) => {
      if (filepath[0] === '~') {
          return path.join(process.env.HOME, filepath.slice(1));
      }

      if (filepath[0] !== '/') {
        return undefined;
      }
      return filepath;
  }

  console.log('THE FILE PATH TO ' + cwd);

  let realPath = resolveHome(cwd);

  if (realPath !== undefined) {
    iconFinder(resolveHome(cwd))
    .then(icon => resolve(Buffer.from(icon).toString('base64')))
    .catch(error => reject(defaultIcon));
  }
});

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

exports.decorateTab = (Tab, { React }) => {
    return class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = {
                iconData: defaultIcon
            };
        }

        render() {
            return (
              React.createElement(Tab, Object.assign({},this.props,{
                customChildren: React.createElement('div',{},
                  React.createElement('img', {
                    className: 'folder_icon',
                    width: 24,
                    height: 24,
                    src:"data:image/png;base64," + this.state.iconData
                  })
                )
              })));
        }

        componentDidMount() {
          localCwd(this.props.text)
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

        componentDidUpdate(prevProps,prevState) {

          if (prevProps.text !== this.props.text) {
            localCwd(this.props.text)
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

      let newProps = Object.assign({},this.props);

      if (tabs.length === 1) {
        newProps = Object.assign({},this.props,{
          customChildren: React.createElement('div',{},
            React.createElement('img', {
              className: 'folder_icon',
              width: 24,
              height: 24,
              src:"data:image/png;base64," + this.state.iconData
            })
          )
        });
      }

      return (
        React.createElement(Tabs, newProps)
      );
    }
  }
};
