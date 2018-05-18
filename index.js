const iconFinder = require('./iconfinder').iconFinder;
const defaultIcon = require('./defaultIcon').icon;
const path = require('path');
const { exec } = require('child_process');

let pid;
var rcwd = '';

const setCwd = (pid, action) => {
    if (process.platform == 'win32') {
        let directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;
        if (action && action.data) {
            let _path = directoryRegex.exec(action.data);
            if(_path){
                rcwd = _path[0];
            }
        }
    } else {
        exec(`lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`, (err, stdout) => {
            rcwd = stdout.trim();
        });
    }

};

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

  let realPath = resolveHome(cwd);

  if (realPath !== undefined) {
    iconFinder(realPath)
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
                iconData: defaultIcon,
                cwd: rcwd
            };

            this.interval = setInterval(() => {
              this.setState({cwd: rcwd});
            },1000);
        }

        componentWillUnmount() {
            clearInterval(this.interval);
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
          localCwd(this.state.cwd)
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

          if (prevState.cwd !== this.state.cwd && this.props.isActive) {
            localCwd(this.state.cwd)
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
            iconData: defaultIcon,
            cwd: rcwd
        };

        this.interval = setInterval(() => {
          this.setState({cwd: rcwd});
        },1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate(prevProps,prevState) {

      const { tabs } = this.props;

      if (tabs.length === 1 && tabs[0].title !== undefined) {

        if (prevState.cwd !== this.state.cwd) {

          localCwd(this.props.cwd)
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

      if (prevState.cwd !== this.state.cwd) {

        localCwd(this.state.cwd)
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


exports.middleware = (store) => (next) => (action) => {
    const uids = store.getState().sessions.sessions;

    switch (action.type) {
        case 'SESSION_SET_XTERM_TITLE':
            pid = uids[action.uid].pid;
            break;

        case 'SESSION_ADD':
            pid = action.pid;
            setCwd(pid);
            break;

        case 'SESSION_ADD_DATA':
            const { data } = action;
            const enterKey = data.indexOf('\n') > 0;

            if (enterKey) {
                setCwd(pid, action);
            }
            break;

        case 'SESSION_SET_ACTIVE':
            pid = uids[action.uid].pid;
            setCwd(pid);
            break;
    }

    next(action);
};
