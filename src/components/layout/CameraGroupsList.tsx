
import { Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Layers } from "lucide-react";
import { useCameraGroups } from "@/hooks/use-camera-groups";

const CameraGroupsList = () => {
  const cameraGroups = useCameraGroups();

  if (cameraGroups.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Camera Groups</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {cameraGroups.map(group => (
            <SidebarMenuItem key={group}>
              <SidebarMenuButton asChild>
                <Link to={`/cameras?group=${encodeURIComponent(group.toLowerCase())}`}>
                  <Layers />
                  <span>{group}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default CameraGroupsList;
