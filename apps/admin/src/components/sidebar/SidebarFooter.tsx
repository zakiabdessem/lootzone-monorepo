import React from "react";
import styled from "@emotion/styled";

import { Badge, Grid, Avatar, Typography } from "@mui/material";
import { green } from "@mui/material/colors";

import useAuth from "@/hooks/useAuth";

const Footer = styled.div`
  background-color: ${(props) =>
    props.theme.sidebar.footer.background} !important;
  padding: ${(props) => props.theme.spacing(2.75)}
    ${(props) => props.theme.spacing(4)};
  border-right: 1px solid rgba(0, 0, 0, 0.12);
`;

const FooterText = styled(Typography)`
  color: ${(props) => props.theme.sidebar.footer.color};
`;

const FooterSubText = styled(Typography)`
  color: ${(props) => props.theme.sidebar.footer.color};
  font-size: 0.7rem;
  display: block;
  padding: 1px;
`;

const FooterBadge = styled(Badge)`
  margin-right: ${(props) => props.theme.spacing(1)};
  span {
    background-color: ${() => green[400]};
    border: 2px solid ${(props) => props.theme.sidebar.footer.background};
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }
`;

const SidebarFooter: React.FC = ({ ...rest }) => {
  const { user } = useAuth();

  return (
    <Footer {...rest}>
      <Grid container spacing={2}>
        <Grid>
          <FooterBadge
            overlap="circular"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            variant="dot"
          >
            {!!user && <Avatar alt={user.displayName} src={user.avatar} />}
            {/* Demo data */}
            {!user && (
              <Avatar
                alt="Lucy Lavender"
                src="/static/img/avatars/avatar-1.jpg"
              />
            )}
          </FooterBadge>
        </Grid>
        <Grid>
          {!!user && (
            <FooterText variant="body2">{user.displayName}</FooterText>
          )}
          {/* Demo data */}
          {!user && <FooterText variant="body2">Lucy Lavender</FooterText>}
          <FooterSubText variant="caption">UX Designer</FooterSubText>
        </Grid>
      </Grid>
    </Footer>
  );
};

export default SidebarFooter;
