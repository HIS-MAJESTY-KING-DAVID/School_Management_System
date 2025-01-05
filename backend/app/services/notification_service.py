from datetime import datetime, timedelta
from flask_mail import Message
from flask import current_app
from app import db, mail
from app.models.resources import BookLending, InventoryItem
from app.models.user import User
from app.models.communication import Notification

class NotificationService:
    @staticmethod
    def send_email(subject, recipients, body):
        """Send email notification"""
        msg = Message(
            subject,
            recipients=recipients,
            body=body
        )
        mail.send(msg)

    @staticmethod
    def check_overdue_books():
        """Check for overdue books and send notifications"""
        today = datetime.utcnow()
        
        # Find overdue books
        overdue_lendings = BookLending.query.filter(
            BookLending.due_date < today,
            BookLending.return_date.is_(None),
            BookLending.notification_sent.is_(False)  # Add this field to BookLending model
        ).all()

        for lending in overdue_lendings:
            user = User.query.get(lending.user_id)
            if user and user.email:
                subject = "Library Book Overdue Notice"
                body = f"""
                Dear {user.name},

                The following book is overdue:
                Title: {lending.book.title}
                Due Date: {lending.due_date.strftime('%Y-%m-%d')}
                
                Please return the book as soon as possible to avoid additional fines.
                Current fine amount: ${lending.fine_amount}

                Best regards,
                Library Management
                """
                NotificationService.send_email(subject, [user.email], body)
                lending.notification_sent = True
                db.session.commit()

    @staticmethod
    def check_upcoming_due_dates():
        """Send reminders for books due soon"""
        today = datetime.utcnow()
        reminder_date = today + timedelta(days=2)  # Send reminder 2 days before due date

        upcoming_lendings = BookLending.query.filter(
            BookLending.due_date <= reminder_date,
            BookLending.due_date > today,
            BookLending.return_date.is_(None),
            BookLending.reminder_sent.is_(False)  # Add this field to BookLending model
        ).all()

        for lending in upcoming_lendings:
            user = User.query.get(lending.user_id)
            if user and user.email:
                subject = "Library Book Due Date Reminder"
                body = f"""
                Dear {user.name},

                This is a reminder that the following book is due soon:
                Title: {lending.book.title}
                Due Date: {lending.due_date.strftime('%Y-%m-%d')}
                
                Please return the book by the due date to avoid fines.

                Best regards,
                Library Management
                """
                NotificationService.send_email(subject, [user.email], body)
                lending.reminder_sent = True
                db.session.commit()

    @staticmethod
    def check_low_stock_items():
        """Check for low stock items and send notifications"""
        low_stock_items = InventoryItem.query.filter(
            InventoryItem.quantity <= InventoryItem.minimum_quantity,
            InventoryItem.notification_sent.is_(False)  # Add this field to InventoryItem model
        ).all()

        if low_stock_items:
            # Get admin users or inventory managers
            admin_users = User.query.filter_by(role='admin').all()
            admin_emails = [user.email for user in admin_users if user.email]

            if admin_emails:
                subject = "Low Stock Alert"
                body = "The following items are running low:\n\n"
                for item in low_stock_items:
                    body += f"""
                    Item: {item.name}
                    Current Quantity: {item.quantity} {item.unit}
                    Minimum Quantity: {item.minimum_quantity} {item.unit}
                    Location: {item.location}
                    Supplier: {item.supplier}
                    """
                    item.notification_sent = True

                body += "\nPlease restock these items soon."
                NotificationService.send_email(subject, admin_emails, body)
                db.session.commit()

    @staticmethod
    def check_upcoming_maintenance():
        """Send notifications for upcoming maintenance tasks"""
        today = datetime.utcnow()
        upcoming_date = today + timedelta(days=7)  # Check for maintenance due in next 7 days

        upcoming_maintenance = MaintenanceRecord.query.filter(
            MaintenanceRecord.next_maintenance_date <= upcoming_date,
            MaintenanceRecord.next_maintenance_date > today,
            MaintenanceRecord.maintenance_reminder_sent.is_(False)  # Add this field to MaintenanceRecord model
        ).all()

        if upcoming_maintenance:
            # Get maintenance staff or admin users
            admin_users = User.query.filter(
                User.role.in_(['admin', 'maintenance'])
            ).all()
            admin_emails = [user.email for user in admin_users if user.email]

            if admin_emails:
                subject = "Upcoming Maintenance Tasks"
                body = "The following items require maintenance soon:\n\n"
                for record in upcoming_maintenance:
                    body += f"""
                    Item: {record.item.name}
                    Maintenance Type: {record.maintenance_type}
                    Due Date: {record.next_maintenance_date.strftime('%Y-%m-%d')}
                    Location: {record.item.location}
                    """
                    record.maintenance_reminder_sent = True

                body += "\nPlease schedule these maintenance tasks."
                NotificationService.send_email(subject, admin_emails, body)
                db.session.commit()

    @staticmethod
    def run_all_checks():
        """Run all notification checks"""
        NotificationService.check_overdue_books()
        NotificationService.check_upcoming_due_dates()
        NotificationService.check_low_stock_items()
        NotificationService.check_upcoming_maintenance()
