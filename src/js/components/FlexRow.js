import { h } from 'hyperapp';

export const FlexRow = (props, children) => h(props.tag || 'div', {
  ...props,
  style: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    ...props.style,
  },
}, children);

