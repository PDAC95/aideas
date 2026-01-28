"""
Seed database with initial test data.
"""

import asyncio
import sys
from datetime import datetime
from pathlib import Path
from uuid import uuid4

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from src.config.database import async_session_factory
from src.modules.organizations.models import Organization
from src.modules.users.models import User, OrganizationMember
from src.modules.automations.models import AutomationTemplate


async def seed_database():
    """Seed the database with initial data."""
    async with async_session_factory() as session:
        # Check if data already exists
        result = await session.execute(select(Organization).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping...")
            return

        print("Seeding database...")

        # Create demo organization
        org_id = str(uuid4())
        demo_org = Organization(
            id=org_id,
            name="Demo Company",
            slug="demo-company",
            plan="pro",
            settings={"timezone": "America/New_York"},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(demo_org)

        # Create demo user
        user_id = str(uuid4())
        demo_user = User(
            id=user_id,
            clerk_id="demo_clerk_id",
            email="demo@aideas.com",
            name="Demo User",
            locale="en",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(demo_user)

        # Create organization member
        member = OrganizationMember(
            id=str(uuid4()),
            organization_id=org_id,
            user_id=user_id,
            role="admin",
            invited_at=datetime.utcnow(),
            joined_at=datetime.utcnow(),
        )
        session.add(member)

        # Create sample automation templates
        templates = [
            {
                "name": "Email Auto-Responder",
                "slug": "email-auto-responder",
                "description": "Automatically respond to common customer inquiries via email.",
                "category": "Customer Service",
                "is_active": True,
            },
            {
                "name": "Invoice Processor",
                "slug": "invoice-processor",
                "description": "Extract data from invoices and sync to your accounting system.",
                "category": "Documents",
                "is_active": True,
            },
            {
                "name": "Lead Qualification Bot",
                "slug": "lead-qualification-bot",
                "description": "Automatically score and qualify incoming leads based on criteria.",
                "category": "Sales",
                "is_active": True,
            },
            {
                "name": "Social Media Scheduler",
                "slug": "social-media-scheduler",
                "description": "AI-powered content creation and scheduling for social media.",
                "category": "Marketing",
                "is_active": True,
            },
            {
                "name": "Inventory Alert System",
                "slug": "inventory-alert-system",
                "description": "Monitor inventory levels and send alerts when stock is low.",
                "category": "Operations",
                "is_active": True,
            },
        ]

        for template_data in templates:
            template = AutomationTemplate(
                id=str(uuid4()),
                **template_data,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(template)

        await session.commit()
        print("Database seeded successfully!")
        print(f"  - Created organization: {demo_org.name}")
        print(f"  - Created user: {demo_user.email}")
        print(f"  - Created {len(templates)} automation templates")


if __name__ == "__main__":
    asyncio.run(seed_database())
