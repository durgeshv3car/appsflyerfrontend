import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

const topTost = (title = 'Action Execute Successfully', icon = 'success') => {
    MySwal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        backdrop: false,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    }).fire({
        icon,
        title
    });
}

export default topTost