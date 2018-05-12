import iconFinder from './iconfinder';

let cwd = '';
let iconData = undefined;

const setCwd = (pid, action) => {
    if (process.platform == 'win32') {
        let directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;
        if (action && action.data) {
            let path = directoryRegex.exec(action.data);
            if(path){
                cwd = path[0];
            }
        }
    } else {
        exec(`lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`, (err, stdout) => {
            cwd = stdout.trim();

            iconFinder(cwd)
            .then(icon => { iconData = icon; })
            .catch(error => { iconData = undefined; });
        });
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


exports.getTabProps = (uid, parentProps, props) => {
  const newProps = { ...props };
  newProps.text = (
    <span>
      <span style={{ verticalAlign: 'middle' }}>{props.text}</span>
    </span>
  );
  return newProps;
};

exports.getTabsProps = (parentProps, props) => {
  if (props.tabs.length !== 1 || typeof props.tabs[0].title !== 'string') return props;
  const newProps = { ...props };
  newProps.tabs[0].title = (
    <span>
      <span style={{ verticalAlign: 'middle' }}>{props.tabs[0].title}</span>
    </span>
  );
  return newProps;
};

exports.decorateTab = (Tab, { React }) => {
    return class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = {
                cwd: '',
                iconData: undefined
            };
        }

        render() {
            const { customChildren } = this.props
            const existingChildren = customChildren ? customChildren instanceof Array ? customChildren : [customChildren] : [];

            return (
                React.createElement(Tab, Object.assign({}, this.props, {
                      React.createElement('div', { className: 'footer_group group_overflow' },
                            React.createElement('div', { className: 'component_component component_cwd' }, "Moises" + this.state.cwd)
                      )
                )
              )
            );
        }

        componentDidMount() {
            this.interval = setInterval(() => {
                this.setState({
                    cwd: cwd,
                    iconData: iconData
                });
            }, 1000);
        }

        componentWillUnmount() {
            clearInterval(this.interval);
        }
    };
};
